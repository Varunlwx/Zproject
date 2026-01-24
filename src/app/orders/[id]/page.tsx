'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useOrders, OrderStatus } from '@/contexts/order-context';
import { useAuth } from '@/contexts/auth-context';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';

// Helper to normalize image paths - ensures path starts with / and has fallback
const normalizeImagePath = (path: string | undefined): string => {
    if (!path) return '/images/products/placeholder.jpg';
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return `/${path}`;
};

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getOrderById, updateOrderStatus } = useOrders();
    const { user, loading } = useAuth();

    const order = getOrderById(id as string);

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loader"></div>
                <style jsx>{`
                    .loading-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAFAFA; }
                    .loader { width: 40px; height: 40px; border: 3px solid #E5E5E5; border-top-color: #E85D04; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!user) {
        router.push('/login?redirect=/orders/' + id);
        return null;
    }

    if (!order) {
        return (
            <div className="page">
                <Navbar />
                <main className="empty-state-container">
                    <div className="empty-state">
                        <div className="icon-circle error">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2>Order Not Found</h2>
                        <p>We couldn't find an order with the ID: {id}</p>
                        <Link href="/orders" className="cta-btn">
                            Back to My Orders
                        </Link>
                    </div>
                </main>
                <style jsx>{`
                    .page { background: #FAFAFA; min-height: 100vh; }
                    main { padding-top: 90px; }
                    .empty-state-container { display: flex; align-items: center; justify-content: center; padding: 100px 24px; }
                    .empty-state { text-align: center; max-width: 400px; }
                    .icon-circle { width: 100px; height: 100px; background: rgba(220, 38, 38, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
                    h2 { font-size: 24px; font-weight: 700; margin: 0 0 8px; color: #1A1A1A; }
                    p { color: #6B6B6B; margin: 0 0 32px; font-size: 15px; }
                    .cta-btn { display: inline-flex; align-items: center; padding: 14px 32px; background: #1A1A1A; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; transition: all 0.2s; }
                    .cta-btn:hover { transform: translateY(-2px); }
                `}</style>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Order tracking steps
    const trackingSteps = [
        { key: 'confirmed', label: 'Order Confirmed', icon: '✓' },
        { key: 'processing', label: 'Processing', icon: '📦' },
        { key: 'shipped', label: 'Shipped', icon: '🚚' },
        { key: 'delivered', label: 'Delivered', icon: '🏠' },
    ];

    const getStepStatus = (stepKey: string) => {
        const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(order.status === 'cancelled' ? 'confirmed' : order.status);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (order.status === 'cancelled') return stepKey === 'confirmed' ? 'completed' : 'cancelled';
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    // Expected delivery date (mock: 5-7 days from order date)
    const getExpectedDelivery = () => {
        const orderDate = new Date(order.createdAt);
        orderDate.setDate(orderDate.getDate() + 5);
        return formatDate(orderDate.toISOString());
    };

    return (
        <div className="page">
            <Navbar />

            <main>
                <section className="page-header">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'My Orders', href: '/orders' },
                        { label: `Order Details` }
                    ]} />
                </section>

                <div className="order-content">
                    {/* Order Header Card */}
                    <div className="order-header-card">
                        <div className="order-header-top">
                            <div className="order-id-section">
                                <span className="order-label">Order ID</span>
                                <span className="order-id">#{order.id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="order-date-section">
                                <span className="order-label">Placed On</span>
                                <span className="order-date">{formatFullDate(order.createdAt)}</span>
                            </div>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <div className="delivery-eta">
                                    <span className="eta-label">Expected Delivery</span>
                                    <span className="eta-date">{getExpectedDelivery()}</span>
                                </div>
                            )}
                        </div>

                        {/* Tracking Timeline */}
                        {order.status !== 'cancelled' ? (
                            <div className="tracking-timeline">
                                {trackingSteps.map((step, index) => (
                                    <div key={step.key} className={`tracking-step ${getStepStatus(step.key)}`}>
                                        <div className="step-indicator">
                                            <div className="step-circle">
                                                {getStepStatus(step.key) === 'completed' ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                ) : (
                                                    <span className="step-number">{index + 1}</span>
                                                )}
                                            </div>
                                            {index < trackingSteps.length - 1 && <div className="step-line"></div>}
                                        </div>
                                        <span className="step-label">{step.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="cancelled-banner">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <span>This order has been cancelled</span>
                            </div>
                        )}
                    </div>

                    <div className="content-grid">
                        {/* Left: Items */}
                        <div className="items-section">
                            <h2 className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                                Items in this Order
                                <span className="item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                            </h2>

                            <div className="items-list">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="item-card">
                                        <div className="item-image">
                                            <Image src={normalizeImagePath(item.image)} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                        </div>
                                        <div className="item-info">
                                            <h3 className="item-name">{item.name}</h3>
                                            <div className="item-details-row">
                                                <span className="item-qty">Qty: {item.quantity}</span>
                                                <span className="item-price">{item.price}</span>
                                            </div>
                                            {order.status === 'delivered' && !item.review && (
                                                <Link href={`/orders?review=${order.id}&item=${item.id}`} className="rate-btn">
                                                    ★ Rate &amp; Review
                                                </Link>
                                            )}
                                            {item.review && (
                                                <div className="reviewed-badge">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    Reviewed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Status Message */}
                            <div className="status-message-card">
                                <div className="status-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                </div>
                                <p>{order.statusMessage}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                {order.status === 'processing' && (
                                    <button className="action-btn cancel-btn" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                                        Cancel Order
                                    </button>
                                )}
                                {order.status === 'delivered' && (
                                    <button className="action-btn exchange-btn" onClick={() => updateOrderStatus(order.id, 'exchange')}>
                                        Return / Exchange
                                    </button>
                                )}
                                <Link href="/orders" className="action-btn secondary-btn">
                                    ← Back to Orders
                                </Link>
                            </div>
                        </div>

                        {/* Right: Summary Cards */}
                        <div className="summary-section">
                            {/* Price Details */}
                            <div className="summary-card">
                                <h3>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                    Price Details
                                </h3>
                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>Subtotal ({order.items.length} items)</span>
                                        <span>₹{order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Delivery</span>
                                        <span className="free">FREE</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="price-row discount">
                                            <span>Discount</span>
                                            <span>-₹{order.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="price-row total">
                                        <span>Total Paid</span>
                                        <span>₹{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="summary-card">
                                <h3>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Delivery Address
                                </h3>
                                <div className="address-content">
                                    <p className="recipient-name">{order.address.fullName}</p>
                                    <p>{order.address.addressLine1}</p>
                                    {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                                    <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                    <div className="contact-info">
                                        <span>📞 {order.address.phone}</span>
                                        {order.address.email && <span>✉️ {order.address.email}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="summary-card">
                                <h3>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                    Payment Method
                                </h3>
                                <div className="payment-content">
                                    <div className="payment-badge">
                                        {order.paymentMethod === 'cod' ? '💵' : '💳'}
                                        <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                                    </div>
                                    {order.paymentId && <p className="payment-id">Payment ID: {order.paymentId}</p>}
                                </div>
                            </div>

                            {/* Need Help */}
                            <div className="help-card">
                                <h4>Need Help?</h4>
                                <p>Contact our support team for any queries about this order.</p>
                                <a href="mailto:support@zcloths.com" className="help-link">
                                    Contact Support →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .page { background: #F5F5F5; min-height: 100vh; color: #1A1A1A; }
                main { padding-top: 70px; padding-bottom: 60px; }
                @media (min-width: 768px) { main { padding-top: 80px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                .page-header { padding: 20px 24px 0; }
                @media (min-width: 768px) { .page-header { padding: 24px 48px 0; } }
                @media (min-width: 1200px) { .page-header { padding: 32px 80px 0; } }

                .order-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                @media (min-width: 768px) { .order-content { padding: 0 48px; } }
                @media (min-width: 1200px) { .order-content { padding: 0 80px; } }

                /* Order Header Card */
                .order-header-card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #E5E5E5; }
                .order-header-top { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 32px; }
                .order-id-section, .order-date-section, .delivery-eta { display: flex; flex-direction: column; gap: 4px; }
                .order-label, .eta-label { font-size: 12px; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                .order-id { font-size: 18px; font-weight: 800; color: #1A1A1A; font-family: monospace; }
                .order-date { font-size: 15px; font-weight: 600; color: #1A1A1A; }
                .eta-date { font-size: 15px; font-weight: 700; color: #E85D04; }

                /* Tracking Timeline */
                .tracking-timeline { display: flex; justify-content: space-between; position: relative; padding: 0 20px; }
                .tracking-step { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; position: relative; }
                .step-indicator { display: flex; flex-direction: column; align-items: center; position: relative; }
                .step-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; border: 2px solid #E5E5E5; background: white; color: #A0A0A0; transition: all 0.3s; z-index: 2; }
                .step-line { position: absolute; top: 17px; left: 36px; width: calc(100% - 18px); height: 2px; background: #E5E5E5; z-index: 1; }
                .tracking-step:last-child .step-line { display: none; }
                .step-label { font-size: 12px; color: #6B6B6B; font-weight: 500; text-align: center; }

                .tracking-step.completed .step-circle { background: #E85D04; border-color: #E85D04; color: white; }
                .tracking-step.completed .step-line { background: #E85D04; }
                .tracking-step.completed .step-label { color: #1A1A1A; font-weight: 600; }
                .tracking-step.current .step-circle { background: #E85D04; border-color: #E85D04; color: white; animation: pulse 2s infinite; }
                .tracking-step.current .step-label { color: #E85D04; font-weight: 700; }
                @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(232, 93, 4, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(232, 93, 4, 0); } }

                .cancelled-banner { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; background: #FEE2E2; color: #DC2626; border-radius: 10px; font-weight: 600; font-size: 14px; }

                /* Content Grid */
                .content-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
                @media (min-width: 1024px) { .content-grid { grid-template-columns: 1.6fr 1fr; } }

                /* Items Section */
                .items-section { display: flex; flex-direction: column; gap: 20px; }
                .section-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; color: #1A1A1A; margin: 0; }
                .item-count { margin-left: auto; font-size: 13px; font-weight: 500; color: #6B6B6B; background: #F5F5F5; padding: 4px 12px; border-radius: 20px; }

                .items-list { display: flex; flex-direction: column; gap: 16px; }
                .item-card { display: flex; gap: 16px; background: white; border-radius: 16px; padding: 16px; border: 1px solid #E5E5E5; }
                .item-image { position: relative; width: 90px; height: 110px; border-radius: 12px; overflow: hidden; background: #F5F5F5; flex-shrink: 0; }
                .item-info { flex: 1; display: flex; flex-direction: column; gap: 8px; }
                .item-name { font-size: 15px; font-weight: 600; margin: 0; color: #1A1A1A; line-height: 1.4; }
                .item-details-row { display: flex; justify-content: space-between; align-items: center; }
                .item-qty { font-size: 13px; color: #6B6B6B; }
                .item-price { font-size: 16px; font-weight: 700; color: #E85D04; }
                .rate-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #FFF7ED; color: #E85D04; font-size: 12px; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.2s; margin-top: 4px; }
                .rate-btn:hover { background: #E85D04; color: white; }
                .reviewed-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #D1FAE5; color: #16A34A; font-size: 12px; font-weight: 600; border-radius: 6px; margin-top: 4px; }

                /* Status Message */
                .status-message-card { display: flex; gap: 12px; padding: 16px 20px; background: #FFF7ED; border-left: 4px solid #E85D04; border-radius: 0 12px 12px 0; }
                .status-icon { color: #E85D04; flex-shrink: 0; margin-top: 2px; }
                .status-message-card p { margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.5; }

                /* Action Buttons */
                .action-buttons { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
                .action-btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; border: none; }
                .cancel-btn { background: #FEE2E2; color: #DC2626; }
                .cancel-btn:hover { background: #DC2626; color: white; }
                .exchange-btn { background: #DBEAFE; color: #2563EB; }
                .exchange-btn:hover { background: #2563EB; color: white; }
                .secondary-btn { background: #F5F5F5; color: #6B6B6B; }
                .secondary-btn:hover { background: #E5E5E5; color: #1A1A1A; }

                /* Summary Section */
                .summary-section { display: flex; flex-direction: column; gap: 20px; }
                .summary-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #E5E5E5; }
                .summary-card h3 { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; margin: 0 0 16px; color: #1A1A1A; }
                .summary-card h3 svg { color: #E85D04; }

                /* Price Breakdown */
                .price-breakdown { display: flex; flex-direction: column; gap: 12px; }
                .price-row { display: flex; justify-content: space-between; font-size: 14px; color: #6B6B6B; }
                .price-row .free { color: #16A34A; font-weight: 600; }
                .price-row.discount { color: #16A34A; }
                .price-row.total { font-size: 16px; font-weight: 700; color: #1A1A1A; margin-top: 12px; padding-top: 12px; border-top: 1px solid #F5F5F5; }

                /* Address */
                .address-content p { margin: 0 0 6px; font-size: 14px; color: #6B6B6B; line-height: 1.5; }
                .recipient-name { font-weight: 700; color: #1A1A1A !important; font-size: 15px !important; margin-bottom: 8px !important; }
                .contact-info { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #F5F5F5; font-size: 13px; color: #6B6B6B; }

                /* Payment */
                .payment-content { display: flex; flex-direction: column; gap: 8px; }
                .payment-badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; background: #F5F5F5; border-radius: 10px; font-size: 14px; font-weight: 600; }
                .upi-id { font-size: 13px; color: #6B6B6B; font-family: monospace; margin: 0; }

                /* Help Card */
                .help-card { background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%); border-radius: 16px; padding: 20px; text-align: center; }
                .help-card h4 { font-size: 15px; font-weight: 700; margin: 0 0 8px; color: #1A1A1A; }
                .help-card p { font-size: 13px; color: #6B6B6B; margin: 0 0 16px; }
                .help-link { display: inline-flex; align-items: center; gap: 6px; color: #E85D04; font-weight: 600; font-size: 14px; text-decoration: none; }
                .help-link:hover { text-decoration: underline; }

                @media (max-width: 768px) {
                    .tracking-timeline { flex-wrap: wrap; gap: 16px; padding: 0; }
                    .tracking-step { flex: none; width: calc(50% - 8px); }
                    .step-line { display: none; }
                    .order-header-top { flex-direction: column; gap: 16px; }
                }
            `}</style>
        </div>
    );
}
