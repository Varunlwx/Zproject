'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useOrders, OrderItem } from '@/contexts/order-context';
import { useAuth } from '@/contexts/auth-context';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';

export default function OrderConfirmationPage() {
    const { id } = useParams();
    const { getOrderById } = useOrders();
    const { user } = useAuth();

    const order = getOrderById(id as string);

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
                        <Link href="/shop" className="cta-btn">
                            Return to Shop
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="page">
            <Navbar />

            <main>
                <section className="confirmation-header">
                    <div className="success-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1>Order Confirmed!</h1>
                    <p className="order-number">Order #{order.id}</p>
                    <p className="success-msg">Your hand-crafted items will be with you soon.</p>
                </section>

                <div className="confirmation-content">
                    <div className="details-grid">
                        {/* Order Summary */}
                        <div className="card">
                            <h3>Items Ordered</h3>
                            <div className="order-items">
                                {order.items.map((item: OrderItem, idx: number) => (
                                    <div key={idx} className="order-item">
                                        <div className="item-image">
                                            <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                        </div>
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <div className="item-meta">
                                                <span>Qty: {item.quantity}</span>
                                                <span className="dot"></span>
                                                <span>{item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pricing-summary">
                                <div className="row">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="row">
                                    <span>Shipping</span>
                                    <span className="free">FREE</span>
                                </div>
                                <div className="row total">
                                    <span>Total Amount</span>
                                    <span>₹{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Payment */}
                        <div className="side-cards">
                            <div className="card">
                                <h3>Delivery Details</h3>
                                <div className="info-section">
                                    <p className="name">{order.address.fullName}</p>
                                    <p>{order.address.phone}</p>
                                    <p>{order.address.addressLine1}</p>
                                    {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                                    <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                </div>
                            </div>

                            <div className="card">
                                <h3>Payment Info</h3>
                                <div className="payment-info">
                                    <div className="payment-method">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                        <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                                    </div>
                                    {order.paymentId && <p className="payment-id">Payment ID: {order.paymentId}</p>}
                                    <p className="date">Placed on {formatDate(order.createdAt)}</p>
                                </div>
                            </div>

                            <div className="card actions-card">
                                <Link href="/orders" className="primary-btn">View All Orders</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .page { background: #FAFAFA; min-height: 100vh; color: #1A1A1A; padding-bottom: 80px; }
                main { padding-top: 90px; }

                .confirmation-header { text-align: center; padding: 60px 24px 40px; }
                .success-icon { width: 80px; height: 80px; background: #16A34A; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 10px 25px rgba(22, 163, 74, 0.3); }
                h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px; }
                .order-number { font-size: 18px; font-weight: 600; color: #E85D04; margin-bottom: 8px; }
                .success-msg { color: #6B6B6B; font-size: 15px; }

                .confirmation-content { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
                .details-grid { display: grid; gap: 32px; grid-template-columns: 1fr; }
                @media (min-width: 768px) {
                    .details-grid { grid-template-columns: 1.5fr 1fr; }
                }

                .card { background: white; border-radius: 20px; border: 1px solid #E5E5E5; padding: 20px; margin-bottom: 24px; }
                .card:last-child { margin-bottom: 0; }
                h3 { font-size: 16px; font-weight: 700; margin: 0 0 16px; color: #1A1A1A; border-bottom: 1px solid #F5F5F5; padding-bottom: 12px; }

                .order-items { display: flex; flex-direction: column; gap: 16px; }
                .order-item { display: flex; gap: 16px; align-items: center; }
                .item-image { position: relative; width: 64px; height: 80px; border-radius: 12px; overflow: hidden; background: #F5F5F5; flex-shrink: 0; }
                .item-info h4 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
                .item-meta { font-size: 13px; color: #6B6B6B; display: flex; align-items: center; gap: 8px; }
                .dot { width: 3px; height: 3px; background: #CBCBCB; border-radius: 50%; }

                .pricing-summary { margin-top: 24px; padding-top: 24px; border-top: 1px dashed #E5E5E5; }
                .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #6B6B6B; }
                .row.total { font-size: 18px; font-weight: 700; color: #1A1A1A; margin-top: 16px; margin-bottom: 0; }
                .free { color: #16A34A; font-weight: 600; }

                .info-section p { font-size: 14px; color: #6B6B6B; margin: 0 0 4px; line-height: 1.5; }
                .info-section p.name { font-weight: 600; color: #1A1A1A; margin-bottom: 8px; }

                .payment-info .payment-method { display: flex; align-items: center; gap: 10px; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
                .payment-info p { font-size: 13px; color: #6B6B6B; margin: 0; }
                .upi-id { font-family: monospace; background: #F5F5F5; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px !important; }
                .date { margin-top: 12px !important; font-style: italic; }

                .side-cards { display: flex; flex-direction: column; gap: 24px; }
                .actions-card { margin-top: 0; }
                .actions { display: flex; flex-direction: column; gap: 12px; }
                .primary-btn { display: flex; align-items: center; justify-content: center; padding: 16px; background: #E85D04; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; transition: all 0.2s; border: none; }
                .secondary-btn { display: flex; align-items: center; justify-content: center; padding: 16px; background: white; color: #1A1A1A; border: 1px solid #E5E5E5; text-decoration: none; border-radius: 12px; font-weight: 600; transition: all 0.2s; }
                .primary-btn:hover { background: #1A1A1A; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .secondary-btn:hover { background: #F9F9F9; border-color: #1A1A1A; transform: translateY(-2px); }
            `}</style>
        </div>
    );
}
