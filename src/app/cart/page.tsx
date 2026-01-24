'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/cart-context';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cartItems, cartCount, cartTotal, removeFromCart, incrementQuantity, decrementQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const handleCheckout = () => {
        if (!user) {
            router.push('/login?redirect=/cart');
            return;
        }
        // Proceed with checkout
        router.push('/checkout');
    };

    return (
        <div className="page">
            {/* Website Header */}
            <Navbar />

            <main>
                {/* Page Header */}
                <section className="page-header">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Cart' }
                    ]} />
                    <h1>Shopping Cart</h1>
                    <p className="item-count">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</p>
                </section>

                {cartItems.length === 0 ? (
                    /* Empty State */
                    <div className="empty-state">
                        <div className="icon-circle">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Add some items to your cart to get started</p>
                        <Link href="/shop" className="cta-btn">
                            Start Shopping
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>
                ) : (
                    /* Cart Content */
                    <section className="cart-content">
                        <div className="cart-layout">
                            <div className="cart-items">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-image">
                                            <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                            {item.tag && (
                                                <span className={`tag ${item.tag.toLowerCase()}`}>{item.tag}</span>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <h3>{item.name}</h3>
                                            <div className="price-info">
                                                <span className="price">{item.price}</span>
                                                {item.originalPrice && (
                                                    <span className="original-price">{item.originalPrice}</span>
                                                )}
                                            </div>
                                            <div className="quantity-controls">
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => decrementQuantity(item.id)}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => incrementQuantity(item.id)}
                                                    aria-label="Increase quantity"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label="Remove from cart"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <button className="clear-cart-btn" onClick={clearCart}>
                                    Clear Cart
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="order-summary">
                                <h2>Order Summary</h2>

                                <div className="order-items">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="order-item">
                                            <div className="order-item-image">
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div className="order-item-info">
                                                <h4>{item.name}</h4>
                                                <div className="order-item-meta">
                                                    <span className="order-item-price">{item.price}</span>
                                                    <span className="order-item-qty">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <button className="checkout-btn" onClick={handleCheckout}>
                                    Proceed to Checkout
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </button>

                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="footer">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <h2>ZCLOTHS</h2>
                            <p>Premium Indian Menswear</p>
                            <p className="footer-desc">Handcrafted clothing that blends traditional Indian aesthetics with modern design.</p>
                        </div>
                        <div className="footer-col">
                            <h4>Shop</h4>
                            <a href="#">Kurtas</a>
                            <a href="#">Hoodies</a>
                            <a href="#">Shirts</a>
                            <a href="#">T-Shirts</a>
                        </div>
                        <div className="footer-col">
                            <h4>Support</h4>
                            <a href="#">Contact Us</a>
                            <a href="#">FAQs</a>
                            <a href="#">Shipping</a>
                            <a href="#">Returns</a>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="#">About Us</a>
                            <a href="#">Careers</a>
                            <a href="#">Press</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2024 Zcloths. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </main>


            <style jsx>{`
                :root {
                    --primary: #1A1A1A;
                    --secondary: #E85D04;
                    --muted: #6B6B6B;
                    --bg: #FAFAFA;
                    --surface: #FFFFFF;
                    --border: #E5E5E5;
                }
                .page { background: var(--bg); min-height: 100vh; color: var(--primary); }

                /* Page Header */
                main { padding-top: 70px; }
                @media (min-width: 768px) { main { padding-top: 80px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                .page-header { padding: 24px 24px 16px; }
                @media (min-width: 768px) { .page-header { padding: 32px 48px 24px; } }
                @media (min-width: 1200px) { .page-header { padding: 40px 80px 32px; } }
                .page-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; }
                @media (min-width: 768px) { .page-header h1 { font-size: 32px; } }
                .item-count { font-size: 14px; color: var(--muted); margin: 0; }

                /* Empty State */
                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; }
                .icon-circle { width: 120px; height: 120px; background: rgba(232, 93, 4, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
                .empty-state h2 { font-size: 22px; font-weight: 600; margin: 0 0 12px; }
                .empty-state p { font-size: 14px; color: var(--muted); margin: 0 0 32px; line-height: 1.5; }
                .cta-btn { display: inline-flex; flex-direction: row; align-items: center; justify-content: center; gap: 10px; padding: 16px 32px; background: var(--secondary); color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; transition: background 0.2s; }
                .cta-btn:hover { background: var(--primary); }
                .cta-btn svg { flex-shrink: 0; }

                /* Cart Content */
                .cart-content { padding: 0 24px 24px; }
                @media (min-width: 768px) { .cart-content { padding: 0 48px 32px; } }
                @media (min-width: 1200px) { .cart-content { padding: 0 80px 40px; } }

                .cart-layout { display: flex; flex-direction: column; gap: 24px; }
                @media (min-width: 1024px) { .cart-layout { flex-direction: row; align-items: flex-start; } }

                /* Cart Items */
                .cart-items { flex: 1; display: flex; flex-direction: column; gap: 16px; }
                .cart-item { display: flex; gap: 16px; background: var(--surface); border-radius: 16px; padding: 16px; border: 1px solid var(--border); position: relative; }
                .cart-item:hover { border-color: var(--secondary); }
                .item-image { position: relative; width: 100px; min-width: 100px; aspect-ratio: 3/4; background: #f5f5f5; border-radius: 12px; overflow: hidden; }
                @media (min-width: 768px) { .item-image { width: 120px; min-width: 120px; } }
                .tag { position: absolute; top: 8px; left: 8px; padding: 4px 8px; background: #1A1A1A; color: white; font-size: 9px; font-weight: 700; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
                .tag.sale { background: #DC2626; }
                .tag.new, .tag.bestseller { background: #E85D04; }
                .item-details { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
                .item-details h3 { font-size: 15px; font-weight: 600; margin: 0; color: var(--primary); }
                @media (min-width: 768px) { .item-details h3 { font-size: 16px; } }
                .price-info { display: flex; align-items: center; gap: 8px; }
                .price { font-size: 16px; font-weight: 700; color: var(--secondary); }
                .original-price { font-size: 13px; color: var(--muted); text-decoration: line-through; }
                .quantity-controls { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
                .qty-btn { width: 32px; height: 32px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .qty-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
                .quantity { font-size: 15px; font-weight: 600; min-width: 24px; text-align: center; }
                .remove-btn { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; background: transparent; border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all 0.2s; }
                .remove-btn:hover { background: #FEE2E2; border-color: #DC2626; color: #DC2626; }
                .clear-cart-btn { align-self: flex-start; padding: 12px 24px; background: transparent; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.2s; }
                .clear-cart-btn:hover { border-color: #DC2626; color: #DC2626; background: #FEE2E2; }

                /* Order Summary */
                .order-summary { background: #FFFFFF; border-radius: 20px; padding: 24px; border: 1px solid #E5E5E5; position: sticky; top: 100px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                @media (min-width: 1024px) { .order-summary { width: 380px; min-width: 380px; } }
                .order-summary h2 { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
                
                .order-items { display: flex; flex-direction: column; gap: 16px; max-height: 280px; overflow-y: auto; }
                .order-item { display: flex; gap: 14px; align-items: center; }
                .order-item-image { position: relative; width: 60px; height: 72px; border-radius: 10px; overflow: hidden; background: #f5f5f5; flex-shrink: 0; }
                .order-item-info { flex: 1; }
                .order-item-info h4 { font-size: 14px; font-weight: 600; margin: 0 0 6px; color: #1A1A1A; line-height: 1.3; }
                .order-item-meta { display: flex; align-items: center; gap: 12px; }
                .order-item-price { font-size: 14px; color: #E85D04; font-weight: 600; }
                .order-item-qty { font-size: 13px; color: #6B6B6B; font-weight: 500; }
                .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; }
                .summary-row.total { font-size: 18px; font-weight: 700; margin-bottom: 0; margin-top: 16px; }
                .free-shipping { color: #16A34A; font-weight: 600; }
                .summary-divider { height: 1px; background: var(--border); margin: 16px 0; }
                .checkout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; background: #E85D04; color: #FFFFFF; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 20px; }
                .checkout-btn:hover { background: #1A1A1A; }


                /* Footer */
                .footer { background: #111; color: white; padding: 48px 24px 40px; margin-top: 40px; }
                @media (min-width: 768px) { .footer { padding: 80px 48px 48px; } }
                @media (min-width: 1200px) { .footer { padding: 100px 80px 48px; } }
                .footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
                .footer-brand { grid-column: 1 / -1; margin-bottom: 16px; }
                @media (min-width: 768px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 64px; } .footer-brand { grid-column: auto; margin-bottom: 0; } }
                .footer-brand h2 { font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 0 0 8px; }
                .footer-brand > p:first-of-type { font-size: 12px; color: var(--secondary); margin: 0 0 16px; }
                .footer-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; max-width: 320px; }
                .footer-col h4 { font-size: 14px; font-weight: 600; margin: 0 0 20px; }
                .footer-col a { display: block; font-size: 14px; color: rgba(255,255,255,0.6); text-decoration: none; margin-bottom: 12px; transition: color 0.2s; }
                .footer-col a:hover { color: white; }
                .footer-bottom { padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 16px; align-items: center; }
                @media (min-width: 768px) { .footer-bottom { flex-direction: row; justify-content: space-between; } }
                .footer-bottom p { font-size: 13px; opacity: 0.5; margin: 0; }
                .footer-links { display: flex; gap: 24px; }
                .footer-links a { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; }
                .footer-links a:hover { color: white; }
            `}</style>
        </div>
    );
}
