'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useOrders } from '@/contexts/order-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { useAddresses } from '@/contexts/address-context';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import { createRazorpayPayment, RazorpaySuccessResponse } from '@/lib/razorpay';
import { getDiscountPercent } from '@/data/products';
import { CouponService } from '@/services/coupon-service';
import { Coupon } from '@/types/schema';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartCount, cartTotal, clearCart } = useCart();
    const { addOrder } = useOrders();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { addresses } = useAddresses();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discount, setDiscount] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Redirect if not logged in (client-side only)
    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/checkout');
        }
    }, [user, router]);

    // Form state
    const [formData, setFormData] = useState({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        upiId: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear selected address when user manually edits the form
        if (['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'].includes(name)) {
            setSelectedAddressId(null);
        }
    };

    const handleAddressSelect = (addressId: string) => {
        const address = addresses.find(a => a.id === addressId);
        if (address) {
            setSelectedAddressId(addressId);
            setFormData(prev => ({
                ...prev,
                fullName: address.fullName,
                phone: address.phone,
                email: address.email || prev.email,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || '',
                city: address.city,
                state: address.state,
                pincode: address.pincode,
            }));
        }
    };

    const handleNewAddress = () => {
        setSelectedAddressId(null);
        setFormData({
            fullName: user?.displayName || '',
            email: user?.email || '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            upiId: formData.upiId, // Keep UPI ID if already entered
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            setIsValidatingCoupon(true);
            const result = await CouponService.validateCoupon(couponCode, cartTotal);

            if (result.valid && result.coupon) {
                const discountAmount = CouponService.calculateDiscount(result.coupon, cartTotal);
                setAppliedCoupon(result.coupon);
                setDiscount(discountAmount);
                setCouponError(null);
                toast.success(`Coupon applied! Saved ₹${discountAmount.toLocaleString()}`);
            } else {
                setAppliedCoupon(null);
                setDiscount(0);
                setCouponError(result.message || 'Invalid coupon');
                // toast.error(result.message || 'Invalid coupon'); // Removing toast to use inline error
            }
        } catch (error) {
            setCouponError('Error validating coupon');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode('');
        setCouponError(null);
        toast.success('Coupon removed');
    };

    const finalTotal = cartTotal - discount;


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        if (cartItems.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create order data - ensure no undefined values for Firestore
            const orderData = {
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                subtotal: cartTotal,
                deliveryFee: 0,
                discount: discount,
                total: finalTotal,
                couponCode: appliedCoupon?.code || null,
                address: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email || '',
                    addressLine1: formData.addressLine1,
                    addressLine2: formData.addressLine2 || '',
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                paymentMethod,
            };

            if (paymentMethod === 'cod') {
                // COD: Create order with server-side verification
                if (!user) {
                    showToast('Please sign in to complete your order', 'error');
                    router.push('/login?redirect=/checkout');
                    return;
                }

                // 1. Get token for authentication
                const idToken = await user.getIdToken();

                // 2. Validate cart and prices on server
                const validateResponse = await fetch('/api/orders/validate-cod', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        cartItems: cartItems.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                        })),
                        couponCode: appliedCoupon?.code || undefined,
                    }),
                });

                if (!validateResponse.ok) {
                    const errorData = await validateResponse.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to verify order details');
                }

                const { verifiedTotal, discount: serverDiscount, finalTotal: serverTotal } = await validateResponse.json();

                // 3. Update order data with server-verified totals
                const verifiedOrderData = {
                    ...orderData,
                    subtotal: verifiedTotal,
                    discount: serverDiscount,
                    total: serverTotal,
                };

                const order = await addOrder(verifiedOrderData);
                clearCart();
                showToast(`Order placed successfully! Order ID: ${order.id}`, 'success');
                router.push(`/order-confirmation/${order.id}`);
            } else {
                // ONLINE: Use Razorpay
                // 1. Check user authentication
                if (!user) {
                    showToast('Please sign in to complete your order', 'error');
                    router.push('/login?redirect=/checkout');
                    return;
                }

                // 2. Get Firebase ID token for authentication
                const idToken = await user.getIdToken();

                // 3. Create Razorpay order via API (with server-side verification)
                const response = await fetch('/api/razorpay/create-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        cartItems: cartItems.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                        })),
                        receipt: `order_${Date.now()}`,
                        notes: {},
                        couponCode: appliedCoupon?.code || undefined,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to create payment order');
                }

                const { orderId, amount: serverAmount, verifiedTotal, verificationDetails } = await response.json();

                // Log verification for debugging
                console.log('Server verified cart:', { verifiedTotal, verificationDetails, serverAmount });

                // 4. Open Razorpay payment modal with SERVER-VERIFIED amount
                await createRazorpayPayment(
                    {
                        amount: serverAmount, // Use server-provided discounted amount (in paise)
                        orderId,
                        customerName: formData.fullName,
                        customerEmail: formData.email,
                        customerPhone: formData.phone,
                    },
                    async (paymentResponse: RazorpaySuccessResponse) => {
                        try {
                            // 3. Get Firebase ID token for verification
                            if (!user) {
                                throw new Error('User not authenticated');
                            }
                            const idToken = await user.getIdToken();

                            // 4. Verify payment with authentication
                            const verifyRes = await fetch('/api/razorpay/verify', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${idToken}`,
                                    'X-Requested-With': 'XMLHttpRequest',
                                },
                                body: JSON.stringify(paymentResponse),
                            });


                            if (verifyRes.ok) {
                                const verifyData = await verifyRes.json();

                                // Check if payment was already processed (replay attack prevention)
                                if (verifyData.already_processed) {
                                    console.log('Payment already verified previously:', {
                                        payment_id: verifyData.payment_id,
                                        order_id: verifyData.order_id,
                                    });

                                    showToast('Payment already processed. Redirecting to orders...', 'info');
                                    router.push('/orders');
                                    return;
                                }

                                // 4. Create order in Firebase (first time verification only)
                                const order = await addOrder({
                                    ...orderData,
                                    paymentId: paymentResponse.razorpay_payment_id,
                                    razorpayOrderId: paymentResponse.razorpay_order_id,
                                });
                                clearCart();
                                showToast('Payment successful!', 'success');
                                router.push(`/order-confirmation/${order.id}`);
                            } else {
                                showToast('Payment verification failed. Contact support.', 'error');
                                setIsSubmitting(false);
                            }
                        } catch (err) {
                            console.error('Payment verification error:', err);
                            showToast('Payment verification failed', 'error');
                            setIsSubmitting(false);
                        }
                    },
                    // On Failure
                    (error: string) => {
                        showToast(error, 'error');
                        setIsSubmitting(false);
                    }
                );
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showToast('Failed to place order. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    // If not logged in, show loading while redirecting (handled in useEffect)
    if (!user) {
        return (
            <div className="page">
                <Navbar />
                <main style={{ paddingTop: '100px', textAlign: 'center' }}>
                    <p>Redirecting to login...</p>
                </main>
            </div>
        );
    }

    // Redirect if cart is empty
    if (cartItems.length === 0) {
        return (
            <div className="page">
                <Navbar />
                <main>
                    <section className="page-header">
                        <Breadcrumb items={[
                            { label: 'Home', href: '/' },
                            { label: 'Cart', href: '/cart' },
                            { label: 'Checkout' }
                        ]} />
                        <h1>Checkout</h1>
                    </section>
                    <div className="empty-state">
                        <div className="icon-circle">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Add some items to your cart before checkout</p>
                        <Link href="/shop" className="cta-btn">
                            Start Shopping
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>
                </main>
                <style jsx>{`
                    .page { background: #FAFAFA; min-height: 100vh; color: #1A1A1A; }
                    main { padding-top: 90px; }
                    .page-header { padding: 40px 80px 32px; }
                    .page-header h1 { font-size: 32px; font-weight: 700; margin: 0; }
                    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; }
                    .icon-circle { width: 120px; height: 120px; background: rgba(232, 93, 4, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
                    .empty-state h2 { font-size: 22px; font-weight: 600; margin: 0 0 12px; }
                    .empty-state p { font-size: 14px; color: #6B6B6B; margin: 0 0 32px; }
                    .cta-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: #E85D04; color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; transition: background 0.2s; }
                    .cta-btn:hover { background: #1A1A1A; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />

            <main>
                <section className="page-header">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Cart', href: '/cart' },
                        { label: 'Checkout' }
                    ]} />
                    <h1>Checkout</h1>
                </section>

                <form className="checkout-content" onSubmit={handleSubmit}>
                    <div className="checkout-layout">
                        {/* Shipping Information */}
                        <div className="form-section">
                            <h2>Shipping Information</h2>

                            {/* Saved Address Selection */}
                            {addresses.length > 0 && (
                                <div className="saved-addresses-section">
                                    <h3 className="subsection-title">Select a Saved Address</h3>
                                    <div className="saved-addresses-grid">
                                        {addresses.map(address => (
                                            <button
                                                key={address.id}
                                                type="button"
                                                className={`saved-address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                                                onClick={() => handleAddressSelect(address.id)}
                                            >
                                                <div className="address-card-header">
                                                    <span className="address-type-badge">{address.type || 'Home'}</span>
                                                    {selectedAddressId === address.id && (
                                                        <svg className="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2.5">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <h4>{address.fullName}</h4>
                                                <p>{address.addressLine1}</p>
                                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            className={`saved-address-card new-address-card ${selectedAddressId === null ? 'selected' : ''}`}
                                            onClick={handleNewAddress}
                                        >
                                            <div className="new-address-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </div>
                                            <span>Use a New Address</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="addressLine1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        id="addressLine1"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="House/Flat No., Building Name"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="addressLine2">Address Line 2</label>
                                    <input
                                        type="text"
                                        id="addressLine2"
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleInputChange}
                                        placeholder="Street, Locality (Optional)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Enter city"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state">State *</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Enter state"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="pincode">Pincode *</label>
                                    <input
                                        type="text"
                                        id="pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="Enter pincode"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <h2 className="section-title">Payment Method</h2>
                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={() => setPaymentMethod('online')}
                                    />
                                    <div className="option-content">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                        <div>
                                            <span className="option-title">Pay Online</span>
                                            <span className="option-desc">UPI, Cards, Netbanking via Razorpay</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <div className="option-content">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 2H7C4.24 2 2 4.24 2 7V17C2 19.76 4.24 22 7 22H17C19.76 22 22 19.76 22 17V7C22 4.24 19.76 2 17 2Z" />
                                            <path d="M8 12L11 15L16 9" />
                                        </svg>
                                        <div>
                                            <span className="option-title">Cash on Delivery</span>
                                            <span className="option-desc">Pay when you receive your order</span>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Order Summary */}
                            <div className="order-summary">
                                <h2>Order Summary</h2>

                                <div className="order-items">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="order-item">
                                            <div className="item-image">
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <div className="item-meta">
                                                    <div className="item-prices">
                                                        <span className="item-price">₹{item.price}</span>
                                                        {item.originalPrice && (
                                                            <>
                                                                <span className="item-original">₹{item.originalPrice}</span>
                                                                <span className="discount-badge">{getDiscountPercent(item as any)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <span className="item-qty">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-divider"></div>

                                {/* Coupon Section */}
                                <div className="coupon-section">
                                    {appliedCoupon ? (
                                        <div className="applied-coupon">
                                            <div className="coupon-info">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                                                    <path d="M15 5l-1.761 1.761a2 2 0 0 0 0 2.828L15 11.35m-6 0l1.761-1.761a2 2 0 0 0 0-2.828L9 5" />
                                                    <path d="M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z" />
                                                </svg>
                                                <span className="code">{appliedCoupon.code}</span>
                                            </div>
                                            <button type="button" className="remove-btn" onClick={handleRemoveCoupon}>Remove</button>
                                        </div>
                                    ) : (
                                        <div className="coupon-input-wrapper">
                                            <div className="coupon-input">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => {
                                                        setCouponCode(e.target.value.toUpperCase());
                                                        if (couponError) setCouponError(null);
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="apply-btn"
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon || !couponCode.trim()}
                                                >
                                                    {isValidatingCoupon ? '...' : 'APPLY'}
                                                </button>
                                            </div>
                                            {couponError && <p className="coupon-error">{couponError}</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row">
                                    <span>Subtotal ({cartCount} items)</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="free-shipping">FREE</span>
                                </div>
                                {discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount ({appliedCoupon?.code})</span>
                                        <span>- ₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toLocaleString()}</span>
                                </div>

                                <button
                                    type="submit"
                                    className="place-order-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner"></span>
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </>
                                    )}
                                </button>


                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <style jsx>{`
                .page { background: #FAFAFA; min-height: 100vh; color: #1A1A1A; }
                
                main { padding-top: 70px; }
                @media (min-width: 768px) { main { padding-top: 80px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                .page-header { padding: 24px 24px 16px; }
                @media (min-width: 768px) { .page-header { padding: 32px 48px 24px; } }
                @media (min-width: 1200px) { .page-header { padding: 40px 80px 32px; } }
                .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
                @media (min-width: 768px) { .page-header h1 { font-size: 32px; } }

                .checkout-content { padding: 0 24px 48px; }
                @media (min-width: 768px) { .checkout-content { padding: 0 48px 64px; } }
                @media (min-width: 1200px) { .checkout-content { padding: 0 80px 80px; } }

                .checkout-layout { display: flex; flex-direction: column; gap: 24px; }
                @media (min-width: 1024px) { .checkout-layout { flex-direction: row; align-items: flex-start; } }

                /* Form Section */
                .form-section { flex: 1; background: #FFFFFF; border-radius: 20px; padding: 24px; border: 1px solid #E5E5E5; }
                @media (min-width: 768px) { .form-section { padding: 32px; } }
                .form-section h2 { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
                .section-title { margin-top: 32px; }

                /* Saved Address Selection */
                .saved-addresses-section { margin-bottom: 24px; }
                .subsection-title { font-size: 14px; font-weight: 600; color: #6B6B6B; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .saved-addresses-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                @media (min-width: 768px) { .saved-addresses-grid { grid-template-columns: repeat(2, 1fr); } }
                .saved-address-card { display: flex; flex-direction: column; align-items: flex-start; text-align: left; padding: 16px; border: 1px solid #E5E5E5; border-radius: 12px; background: #FFFFFF; cursor: pointer; transition: all 0.2s; }
                .saved-address-card:hover { border-color: #E85D04; }
                .saved-address-card.selected { border-color: #E85D04; background: rgba(232, 93, 4, 0.05); }
                .address-card-header { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px; }
                .address-type-badge { display: inline-block; padding: 4px 10px; background: #1A1A1A; color: #FFFFFF; font-size: 10px; font-weight: 700; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.5px; }
                .check-icon { flex-shrink: 0; }
                .saved-address-card h4 { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: #1A1A1A; }
                .saved-address-card p { font-size: 13px; color: #6B6B6B; margin: 0; line-height: 1.4; }
                .new-address-card { align-items: center; justify-content: center; min-height: 110px; border-style: dashed; }
                .new-address-card:hover { background: rgba(232, 93, 4, 0.02); }
                .new-address-icon { width: 40px; height: 40px; background: rgba(232, 93, 4, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #E85D04; margin-bottom: 8px; }
                .new-address-card span { font-size: 13px; font-weight: 600; color: #6B6B6B; }

                .form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
                @media (min-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; gap: 20px; } }
                .form-group.full-width { grid-column: 1 / -1; }

                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 14px; font-weight: 600; color: #1A1A1A; }
                .form-group input, .form-group select { padding: 14px 16px; border: 1px solid #E5E5E5; border-radius: 10px; font-size: 15px; transition: all 0.2s; outline: none; }
                .form-group input:focus, .form-group select:focus { border-color: #E85D04; box-shadow: 0 0 0 3px rgba(232, 93, 4, 0.1); }
                .form-group input::placeholder { color: #A0A0A0; }

                /* Payment Options */
                .payment-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
                .payment-option { display: flex; align-items: center; padding: 16px; border: 1px solid #E5E5E5; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
                .payment-option:hover { border-color: #E85D04; }
                .payment-option.selected { border-color: #E85D04; background: rgba(232, 93, 4, 0.05); }
                .payment-option input { display: none; }
                .option-content { display: flex; align-items: center; gap: 16px; }
                .option-content svg { color: #E85D04; }
                .option-title { display: block; font-size: 15px; font-weight: 600; }
                .option-desc { display: block; font-size: 13px; color: #6B6B6B; margin-top: 2px; }
                .upi-input { margin-top: 8px; }

                /* Order Summary */
                .order-summary { background: #FFFFFF; border-radius: 20px; padding: 24px; border: 1px solid #E5E5E5; position: sticky; top: 100px; }
                @media (min-width: 1024px) { .order-summary { width: 380px; min-width: 380px; } }
                .order-summary h2 { font-size: 18px; font-weight: 700; margin: 0 0 20px; }

                .order-items { display: flex; flex-direction: column; gap: 16px; max-height: 280px; overflow-y: auto; }
                .order-item { display: flex; gap: 14px; align-items: center; }
                .item-image { position: relative; width: 60px; height: 72px; border-radius: 10px; overflow: hidden; background: #f5f5f5; flex-shrink: 0; }
                .item-info { flex: 1; }
                .item-info h4 { font-size: 14px; font-weight: 600; margin: 0 0 6px; color: #1A1A1A; line-height: 1.3; }
                .item-meta { display: flex; align-items: center; gap: 12px; }
                .item-price { font-size: 14px; color: #E85D04; font-weight: 600; }
                .item-qty { font-size: 13px; color: #6B6B6B; font-weight: 500; }

                .summary-divider { height: 1px; background: #E5E5E5; margin: 16px 0; }

                .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; }
                .summary-row.total { font-size: 18px; font-weight: 700; margin-bottom: 0; margin-top: 16px; }
                .summary-row.discount { color: #22C55E; font-weight: 600; }
                .free-shipping { color: #16A34A; font-weight: 600; }

                /* Coupon Section */
                .coupon-section { margin: 8px 0; }
                .coupon-input { display: flex; gap: 8px; }
                .coupon-input input { flex: 1; padding: 12px; border: 1px solid #E5E5E5; border-radius: 10px; font-size: 14px; outline: none; text-transform: uppercase; font-family: monospace; }
                .coupon-input input:focus { border-color: #E85D04; }
                .apply-btn { padding: 0 20px; background: #000; color: #fff; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .apply-btn:hover:not(:disabled) { background: #E85D04; }
                .apply-btn:disabled { background: #EEE; color: #BBB; cursor: not-allowed; }
                
                .applied-coupon { display: flex; justify-content: space-between; align-items: center; background: rgba(34, 197, 94, 0.05); padding: 12px 16px; border-radius: 10px; border: 1px dashed #22C55E; }
                .coupon-info { display: flex; align-items: center; gap: 8px; }
                .coupon-info .code { font-size: 14px; font-weight: 700; color: #22C55E; font-family: monospace; }
                .remove-btn { background: none; border: none; color: #DC2626; font-size: 12px; font-weight: 600; cursor: pointer; }
                
                .coupon-error { color: #DC2626; font-size: 11px; font-weight: 500; margin-top: 6px; margin-left: 4px; }

                .place-order-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; background: #E85D04; color: #FFFFFF; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 20px; }
                .place-order-btn:hover:not(:disabled) { background: #1A1A1A; }
                .place-order-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }


            `}</style>
        </div>
    );
}
