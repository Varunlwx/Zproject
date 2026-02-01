'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import { getDiscountPercent } from '@/data/products';

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
    const { addToCart, getCartItem } = useCart();

    return (
        <div className="page">
            {/* Website Header */}
            <Navbar />

            <main>
                {/* Page Header */}
                <section className="page-header">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Wishlist' }
                    ]} />
                    <h1>My Wishlist</h1>
                    <p className="item-count">{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</p>
                </section>

                {wishlistItems.length === 0 ? (
                    /* Empty State */
                    <div className="empty-state">
                        <div className="icon-circle">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save your favorite items here for easy access later</p>
                        <Link href="/shop" className="cta-btn">
                            Explore Products
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>
                ) : (
                    /* Wishlist Content */
                    <section className="wishlist-content">
                        <div className="wishlist-grid">
                            {wishlistItems.map((item) => (
                                <div key={item.id} className="product-card">
                                    <div className="product-image">
                                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                        {item.tag && (
                                            <span className={`tag ${item.tag.toLowerCase()}`}>{item.tag}</span>
                                        )}
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromWishlist(item.id)}
                                            aria-label="Remove from wishlist"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#E85D04" stroke="#E85D04" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="product-details">
                                        <h3>{item.name}</h3>
                                        <div className="price-row">
                                            <div className="price-info">
                                                <span className="price">₹{item.price}</span>
                                                {item.originalPrice && (
                                                    <>
                                                        <span className="original-price">₹{item.originalPrice}</span>
                                                        <span className="discount-badge">{getDiscountPercent(item as any)}</span>
                                                    </>
                                                )}
                                            </div>
                                            <button
                                                className="price-cart-btn"
                                                onClick={() => addToCart(item)}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => addToCart(item)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                            </svg>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                .mobile-only { display: flex; }
                .desktop-only { display: none; }
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                    .desktop-only { display: flex; }
                }



                /* Page Header */
                main { padding-top: 70px; }
                @media (min-width: 768px) { main { padding-top: 80px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                .page-header { padding: 24px 24px 16px; }
                @media (min-width: 768px) { .page-header { padding: 32px 48px 24px; } }
                @media (min-width: 1200px) { .page-header { padding: 40px 80px 32px; } }
                .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 8px; }
                .breadcrumb a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
                .breadcrumb a:hover { color: var(--secondary); }
                .breadcrumb span { color: var(--muted); }
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

                /* Wishlist Content */
                .wishlist-content { padding: 0 24px 24px; }
                @media (min-width: 768px) { .wishlist-content { padding: 0 48px 32px; } }
                @media (min-width: 1200px) { .wishlist-content { padding: 0 80px 40px; } }

                /* Wishlist Grid */
                .wishlist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                @media (min-width: 768px) { .wishlist-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
                @media (min-width: 1024px) { .wishlist-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; } }
                @media (min-width: 1400px) { .wishlist-grid { grid-template-columns: repeat(5, 1fr); gap: 32px; } }
                .product-card { background: var(--surface); border-radius: 24px; overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; position: relative; }
                .product-card:hover { border-color: var(--secondary); box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-4px); }
                .product-image { position: relative; aspect-ratio: 3/4; background: #f5f5f5; border-radius: 24px; overflow: hidden; }
                .tag { position: absolute; top: 12px; left: 12px; padding: 6px 12px; background: #1A1A1A; color: white; font-size: 10px; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
                .tag.sale { background: #DC2626; }
                .tag.new, .tag.bestseller { background: #E85D04; }
                .tag.trending { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); }
                .tag.premium { background: linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%); }
                .remove-btn { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; background: var(--surface); border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; z-index: 2; }
                .remove-btn:hover { transform: scale(1.1); background: #FEE2E2; }
                .product-details { padding: 16px; }
                .product-details h3 { font-size: 15px; font-weight: 600; margin: 0 0 8px; color: var(--primary); }
                .price-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 20px; }
                .price-container { display: flex; align-items: center; gap: 8px; }
                .price { font-size: 17px; font-weight: 700; color: var(--secondary); }
                .original-price { font-size: 13px; color: var(--muted); text-decoration: line-through; }
                .price-cart-btn { position: relative; width: 40px; height: 36px; background: #1A1A1A; color: white; border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .price-cart-btn:hover { background: #333; transform: scale(1.05); }
                .cart-item-badge { position: absolute; top: -8px; right: -8px; background: var(--secondary); color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 2px; border: 2px solid white; }
                .add-to-cart-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .add-to-cart-btn:hover { background: var(--secondary); }

                /* Continue Shopping */
                .continue-section { padding: 16px 24px 48px; }
                @media (min-width: 768px) { .continue-section { padding: 16px 48px 64px; } }
                @media (min-width: 1200px) { .continue-section { padding: 16px 80px 80px; } }
                .continue-link { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
                .continue-link:hover { color: var(--primary); }

                /* Footer */
                .footer { background: #111; color: white; padding: 48px 24px 40px; }
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
