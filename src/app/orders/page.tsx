'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrders, OrderStatus } from '@/contexts/order-context';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import { toast } from 'react-hot-toast';

// Helper to normalize image paths - ensures path starts with / and has fallback
const normalizeImagePath = (path: string | undefined): string => {
    if (!path) return '/images/products/placeholder.jpg';
    // If path already starts with / or is an absolute URL, use it as is
    if (path.startsWith('/') || path.startsWith('http')) return path;
    // Add leading / for relative paths
    return `/${path}`;
};

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const { orders, addReview, updateOrderStatus } = useOrders();

    // Feedback State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ orderId: string, itemId: string, name: string } | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewImages, setReviewImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const openFeedbackModal = (orderId: string, itemId: string, name: string) => {
        setSelectedItem({ orderId, itemId, name });
        setRating(0);
        setComment('');
        setReviewImages([]);
        setShowFeedbackModal(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setUploading(true);
            const newImages: string[] = [];
            const readers: FileReader[] = [];

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                readers.push(reader);
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        newImages.push(reader.result);
                        if (newImages.length === files.length) {
                            setReviewImages(prev => [...prev, ...newImages].slice(0, 3));
                            setUploading(false);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const submitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem && rating > 0) {
            try {
                setIsSubmittingReview(true);
                const userName = user?.displayName || user?.email?.split('@')[0] || 'Anonymous';
                await addReview(selectedItem.orderId, selectedItem.itemId, {
                    rating,
                    comment,
                    images: reviewImages
                }, userName);

                toast.success('Review submitted for moderation!');
                setShowFeedbackModal(false);
            } catch (error) {
                console.error('Error submitting review:', error);
                toast.error('Failed to submit review');
            } finally {
                setIsSubmittingReview(false);
            }
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status: OrderStatus) => {
        switch (status) {
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'exchange': return 'status-exchange';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

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
        return (
            <div className="not-logged-in">
                <Navbar />
                <div className="content">
                    <div className="icon-circle">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    </div>
                    <h2>Sign in to view orders</h2>
                    <p>Track your current orders and view history</p>
                    <Link href="/login" className="sign-in-btn">Sign In</Link>
                </div>
                <style jsx>{`
                    .not-logged-in { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAFAFA; }
                    .content { text-align: center; max-width: 400px; padding: 24px; }
                    .icon-circle { width: 120px; height: 120px; margin: 0 auto 32px; background: rgba(232, 93, 4, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                    .content h2 { font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px; }
                    .content p { font-size: 14px; color: #6B6B6B; margin: 0 0 32px; line-height: 1.5; }
                    .sign-in-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #E85D04; color: white; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; transition: background 0.2s; }
                    .sign-in-btn:hover { background: #1A1A1A; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />

            <main>
                {/* Page Title */}
                <section className="page-header">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Profile', href: '/profile' },
                        { label: 'Orders' }
                    ]} />
                    <h1>My Orders</h1>
                </section>

                <section className="orders-section">
                    <div className="orders-grid">
                        {orders.length === 0 ? (
                            <div className="no-orders">
                                <div className="no-orders-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </div>
                                <p>No orders yet</p>
                                <Link href="/shop" className="shop-now-btn">Start Shopping</Link>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map(order => (
                                    <div key={order.id} className="order-card">
                                        {/* Order Header with ID, Date, and Status */}
                                        <div className="order-header">
                                            <div className="order-meta">
                                                <h3 className="order-id">Order #{order.id}</h3>
                                                <span className="order-date">{formatDate(order.createdAt)}</span>
                                            </div>
                                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Order Items */}
                                        <div className="order-body">
                                            <div className="items-container">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="item-row">
                                                        <div className="item-image-wrapper">
                                                            <Image
                                                                src={normalizeImagePath(item.image)}
                                                                alt={item.name}
                                                                fill
                                                                sizes="64px"
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div className="item-info">
                                                            <span className="item-name">{item.name}</span>
                                                            <span className="item-qty">Qty: {item.quantity}</span>
                                                        </div>
                                                        <span className="item-price">₹{item.price}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="more-items-text">+{order.items.length - 2} more item(s)</p>
                                                )}
                                            </div>

                                            {/* Order Total */}
                                            <div className="order-summary">
                                                <div className="summary-row">
                                                    <span className="summary-label">Total Amount</span>
                                                    <span className="summary-amount">₹{order.total.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Footer with Actions */}
                                        <div className="order-footer">
                                            <div className="footer-content">
                                                <div className="status-info">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                    <p className="status-text">{order.statusMessage}</p>
                                                </div>
                                                <Link href={`/orders/${order.id}`} className="view-details-btn">
                                                    View Details
                                                </Link>
                                            </div>

                                            {/* Rate Product Actions (For Delivered Orders) */}
                                            {order.status === 'delivered' && (
                                                <div className="rating-actions">
                                                    {order.items.map(item => (
                                                        <div key={`rate-${item.id}`} className="rate-item">
                                                            {item.review ? (
                                                                <div className="rated-badge">
                                                                    <span className="rating-stars">{'★'.repeat(item.review.rating)}{'☆'.repeat(5 - item.review.rating)}</span>
                                                                    <span className="rated-text">Reviewed</span>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => openFeedbackModal(order.id, item.id, item.name)}
                                                                    className="rate-product-btn"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                                    </svg>
                                                                    Rate {item.name}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Dev Button */}
                                            {order.status !== 'delivered' && (
                                                <button
                                                    className="dev-btn"
                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                >
                                                    [DEV] Mark Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Rate & Review</h3>
                            <button className="close-btn" onClick={() => setShowFeedbackModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitFeedback}>
                            <div className="modal-body">
                                <p className="product-name">Reviewing: <strong>{selectedItem?.name}</strong></p>

                                {/* Star Rating */}
                                <div className="rating-input">
                                    <label>Rate Product</label>
                                    <div className="stars-container">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`star-btn ${rating >= star ? 'filled' : ''}`}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="image-upload">
                                    <label>Add Photos (Optional)</label>
                                    <div className="image-preview-container">
                                        {reviewImages.map((img, idx) => (
                                            <div key={idx} className="preview-box">
                                                <Image src={img} alt="Preview" width={60} height={60} style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                                <button
                                                    type="button"
                                                    className="remove-img"
                                                    onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {reviewImages.length < 3 && (
                                            <label className="upload-btn">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    hidden
                                                />
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span>+ Add</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Text Review */}
                                <div className="form-group">
                                    <label>Write a Review</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="What did you like or dislike?"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowFeedbackModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-feedback-btn" disabled={rating === 0 || isSubmittingReview}>
                                    {isSubmittingReview ? (
                                        <div className="btn-loader"></div>
                                    ) : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

                .page-header { padding: 20px 24px 16px; }
                @media (min-width: 768px) { .page-header { padding: 28px 48px 20px; } }
                @media (min-width: 1200px) { .page-header { padding: 36px 80px 24px; } }
                .page-header h1 { font-size: 26px; font-weight: 700; margin: 0; }
                @media (min-width: 768px) { .page-header h1 { font-size: 30px; } }

                /* Orders Section */
                .orders-section { padding: 0 16px 40px; max-width: 900px; margin: 0 auto; }
                @media (min-width: 768px) { .orders-section { padding: 0 32px 56px; } }
                @media (min-width: 1200px) { .orders-section { padding: 0 40px 70px; } }

                /* No Orders State */
                .no-orders { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 48px 24px; text-align: center; }
                .no-orders-icon { width: 80px; height: 80px; margin: 0 auto 16px; background: var(--bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .no-orders p { color: var(--muted); margin: 0 0 20px; font-size: 15px; }
                .shop-now-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--secondary); color: white; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
                .shop-now-btn:hover { background: var(--primary); transform: translateY(-2px); }
                
                /* Orders List */
                .orders-list { display: flex; flex-direction: column; gap: 20px; }

                /* Order Card - New Clean Design */
                .order-card { 
                    background: var(--surface); 
                    border: 1px solid #D1D5DB; 
                    border-radius: 16px; 
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                /* Order Header */
                .order-header { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    background: #FAFAFA;
                }
                .order-meta { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
                .order-id { 
                    font-size: 15px; 
                    font-weight: 700; 
                    color: var(--primary); 
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                @media (min-width: 768px) { .order-id { font-size: 16px; } }
                .order-date { font-size: 13px; color: var(--muted); }
                
                /* Status Badge */
                .status-badge { 
                    padding: 6px 14px; 
                    border-radius: 20px; 
                    font-size: 12px; 
                    font-weight: 700; 
                    text-transform: capitalize;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .status-processing { background: #FEF3C7; color: #D97706; }
                .status-shipped { background: #DBEAFE; color: #2563EB; }
                .status-delivered { background: #D1FAE5; color: #059669; }
                .status-exchange { background: #FFEDD5; color: #EA580C; }
                .status-cancelled { background: #FEE2E2; color: #DC2626; }

                /* Order Body */
                .order-body { padding: 20px; }

                /* Items Container */
                .items-container { margin-bottom: 16px; }
                .item-row { 
                    display: flex; 
                    align-items: center; 
                    gap: 14px; 
                    padding: 12px 0;
                }
                .item-row:not(:last-child) { 
                    border-bottom: 1px dashed var(--border); 
                }
                .item-image-wrapper { 
                    position: relative; 
                    width: 64px; 
                    height: 80px; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    flex-shrink: 0;
                    background: #F5F5F5;
                }
                @media (max-width: 480px) {
                    .item-image-wrapper { width: 56px; height: 70px; }
                }
                .item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
                .item-name { 
                    font-size: 14px; 
                    font-weight: 600; 
                    color: var(--primary); 
                    white-space: nowrap; 
                    overflow: hidden; 
                    text-overflow: ellipsis;
                    line-height: 1.4;
                }
                @media (min-width: 768px) { .item-name { font-size: 15px; } }
                .item-qty { font-size: 13px; color: var(--muted); }
                .item-price { 
                    font-size: 15px; 
                    font-weight: 700; 
                    color: var(--secondary); 
                    flex-shrink: 0;
                }
                @media (min-width: 768px) { .item-price { font-size: 16px; } }
                .more-items-text { 
                    font-size: 13px; 
                    color: var(--muted); 
                    margin: 8px 0 0; 
                    padding-left: 78px;
                }
                @media (max-width: 480px) {
                    .more-items-text { padding-left: 70px; }
                }

                /* Order Summary */
                .order-summary { 
                    padding-top: 16px; 
                    margin-top: 4px;
                    border-top: 1px solid var(--border);
                }
                .summary-row { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between;
                }
                .summary-label { 
                    font-size: 14px; 
                    color: var(--muted); 
                    font-weight: 600;
                }
                .summary-amount { 
                    font-size: 20px; 
                    font-weight: 700; 
                    color: var(--primary);
                }
                @media (min-width: 768px) { .summary-amount { font-size: 22px; } }

                /* Order Footer */
                .order-footer { 
                    padding: 16px 20px;
                    background: #FAFAFA;
                    border-top: 1px solid var(--border);
                }
                .footer-content { 
                    display: flex; 
                    flex-direction: column;
                    gap: 12px;
                }
                @media (min-width: 768px) {
                    .footer-content { 
                        flex-direction: row; 
                        align-items: center; 
                        justify-content: space-between;
                    }
                }
                .status-info { 
                    display: flex; 
                    align-items: flex-start; 
                    gap: 10px;
                    flex: 1;
                }
                .status-info svg { 
                    color: var(--secondary); 
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .status-text { 
                    font-size: 14px; 
                    color: var(--muted); 
                    margin: 0; 
                    line-height: 1.5;
                }
                .view-details-btn { 
                    display: inline-flex; 
                    align-items: center; 
                    justify-content: center;
                    padding: 12px 24px; 
                    background: var(--primary); 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    transition: background 0.2s;
                    white-space: nowrap;
                }
                .view-details-btn:hover { 
                    background: var(--secondary);
                }
                @media (max-width: 767px) {
                    .view-details-btn { 
                        width: 100%; 
                        justify-content: center; 
                    }
                }

                /* Rating Actions */
                .rating-actions { 
                    margin-top: 16px; 
                    padding-top: 16px;
                    border-top: 1px dashed var(--border);
                    display: flex; 
                    flex-direction: column; 
                    gap: 10px;
                }
                .rate-item { display: flex; justify-content: flex-end; }
                .rate-product-btn { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 8px; 
                    padding: 8px 16px; 
                    background: transparent; 
                    border: 1.5px solid var(--secondary); 
                    color: var(--secondary); 
                    border-radius: 8px; 
                    font-size: 13px; 
                    font-weight: 600; 
                    cursor: pointer; 
                    transition: all 0.2s;
                }
                .rate-product-btn:hover { 
                    background: var(--secondary); 
                    color: white;
                    transform: translateY(-1px);
                }
                .rated-badge { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 8px; 
                    padding: 8px 16px;
                    background: #F0FDF4;
                    border: 1px solid #86EFAC;
                    border-radius: 8px;
                }
                .rating-stars { 
                    color: #F59E0B; 
                    font-size: 14px;
                    letter-spacing: 2px;
                }
                .rated-text { 
                    font-size: 13px; 
                    color: #059669;
                    font-weight: 600;
                }

                /* Dev Button */
                .dev-btn {
                    margin-top: 12px;
                    font-size: 11px;
                    padding: 6px 12px;
                    background: #E5E7EB;
                    border: 1px solid #D1D5DB;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #6B6B6B;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .dev-btn:hover {
                    background: #D1D5DB;
                }

                /* Feedback Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px); }
                .modal-container { background: white; border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
                .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
                .modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--primary); }
                
                .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
                .product-name { margin: 0; font-size: 14px; color: var(--primary); }
                
                .rating-input label, .image-upload label, .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--primary); }
                
                .stars-container { display: flex; gap: 6px; }
                .star-btn { font-size: 36px; color: #6B6B6B; background: none; border: none; cursor: pointer; transition: all 0.2s; padding: 0; line-height: 1; }
                .star-btn.filled { color: #F59E0B; transform: scale(1.1); }
                .star-btn:hover { color: #FCD34D; transform: scale(1.1); }
                
                .image-preview-container { display: flex; gap: 12px; }
                .preview-box { position: relative; width: 60px; height: 60px; }
                .remove-img { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; background: white; border: 1px solid var(--border); border-radius: 50%; color: var(--primary); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                
                .upload-btn { width: 60px; height: 60px; border: 1px dashed var(--border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); gap: 4px; transition: all 0.2s; }
                .upload-btn:hover { border-color: var(--secondary); color: var(--secondary); background: rgba(232, 93, 4, 0.05); }
                .upload-btn span { font-size: 10px; font-weight: 600; }
                
                .form-group textarea { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); font-family: inherit; font-size: 14px; outline: none; resize: vertical; }
                .form-group textarea:focus { border-color: var(--secondary); }
                
                .submit-feedback-btn { flex: 1; padding: 14px; background: #E85D04; color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; }
                .submit-feedback-btn:hover:not(:disabled) { background: #1A1A1A; }
                .submit-feedback-btn:disabled { opacity: 0.6; cursor: not-allowed; background: #9CA3AF; }
                
                .cancel-btn { flex: 1; padding: 14px; background: #F3F4F6; color: #1F2937; border: 1px solid #E5E7EB; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; }
                .cancel-btn:hover { background: #E5E7EB; }
                
                .btn-loader { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

                .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border); background: white; flex-shrink: 0; display: flex; gap: 12px; }
                .close-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
                .close-btn:hover { color: var(--primary); }
            `}</style>
        </div>
    );
}
