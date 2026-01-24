'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
    return (
        <div className="page">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="about-hero">
                    <div className="hero-content">
                        <h1>About ZCLOTHS</h1>
                        <p>Premium Indian Menswear for the Modern Gentleman</p>
                    </div>
                </section>

                {/* Our Story */}
                <section className="section">
                    <div className="content-wrapper">
                        <div className="story-grid">
                            <div className="story-content">
                                <h2>Our Story</h2>
                                <p>
                                    Founded with a passion for blending traditional Indian craftsmanship with contemporary
                                    design, ZCLOTHS has grown from a small boutique into a beloved destination for
                                    men who appreciate quality and style.
                                </p>
                                <p>
                                    We believe that clothing is more than just fabric – it&apos;s an expression of identity,
                                    culture, and confidence. Every piece in our collection is carefully curated to help
                                    you look and feel your best, whether you&apos;re attending a wedding, heading to the office,
                                    or enjoying a casual weekend.
                                </p>
                            </div>
                            <div className="story-image">
                                <Image
                                    src="/images/collections/Kurta.jpg"
                                    alt="Our Story"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Values */}
                <section className="section values-section">
                    <div className="content-wrapper">
                        <h2 className="section-title">Our Values</h2>
                        <div className="values-grid">
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <h3>Quality First</h3>
                                <p>We source only the finest fabrics and work with skilled artisans to ensure every garment meets our high standards.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <h3>Timeless Design</h3>
                                <p>Our designs blend traditional aesthetics with modern sensibilities, creating pieces that never go out of style.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <h3>Customer Love</h3>
                                <p>Your satisfaction is our priority. We&apos;re committed to providing exceptional service and a seamless shopping experience.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="section">
                    <div className="content-wrapper">
                        <div className="story-grid reverse">
                            <div className="story-image">
                                <Image
                                    src="/images/collections/Hoddie-2.jpg"
                                    alt="Why Choose Us"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div className="story-content">
                                <h2>Why Choose Us?</h2>
                                <ul className="features-list">
                                    <li>
                                        <strong>Handpicked Collections</strong> – Every item is carefully selected for quality and style
                                    </li>
                                    <li>
                                        <strong>Premium Fabrics</strong> – From silk to cotton, we use only the best materials
                                    </li>
                                    <li>
                                        <strong>Free Shipping</strong> – Enjoy free delivery on all orders
                                    </li>
                                    <li>
                                        <strong>Easy Returns</strong> – Hassle-free returns within 30 days
                                    </li>
                                    <li>
                                        <strong>Secure Payments</strong> – Multiple payment options with bank-grade security
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

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
                            <Link href="/shop">Kurtas</Link>
                            <Link href="/shop">Hoodies</Link>
                            <Link href="/shop">Shirts</Link>
                            <Link href="/shop">T-Shirts</Link>
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
                            <Link href="/about">About Us</Link>
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

                main { padding-top: 70px; }
                @media (min-width: 768px) { main { padding-top: 80px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                /* Hero */
                .about-hero { background: linear-gradient(135deg, #1A1A1A 0%, #333 100%); padding: 80px 24px; text-align: center; color: white; }
                @media (min-width: 768px) { .about-hero { padding: 120px 48px; } }
                .hero-content h1 { font-size: 36px; font-weight: 700; margin: 0 0 12px; letter-spacing: 2px; }
                @media (min-width: 768px) { .hero-content h1 { font-size: 48px; } }
                .hero-content p { font-size: 16px; opacity: 0.8; margin: 0; }

                /* Sections */
                .section { padding: 64px 24px; }
                @media (min-width: 768px) { .section { padding: 80px 48px; } }
                @media (min-width: 1200px) { .section { padding: 100px 80px; } }
                .content-wrapper { max-width: 1200px; margin: 0 auto; }
                .section-title { font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 48px; }

                /* Story Grid */
                .story-grid { display: grid; gap: 40px; align-items: center; }
                @media (min-width: 768px) { .story-grid { grid-template-columns: 1fr 1fr; gap: 64px; } }
                .story-grid.reverse .story-content { order: 2; }
                @media (min-width: 768px) { .story-grid.reverse .story-content { order: 1; } .story-grid.reverse .story-image { order: 2; } }
                .story-content h2 { font-size: 28px; font-weight: 700; margin: 0 0 20px; }
                @media (min-width: 768px) { .story-content h2 { font-size: 36px; } }
                .story-content p { font-size: 16px; line-height: 1.8; color: var(--muted); margin: 0 0 16px; }
                .story-image { position: relative; height: 300px; border-radius: 20px; overflow: hidden; }
                @media (min-width: 768px) { .story-image { height: 400px; } }

                /* Values Section */
                .values-section { background: var(--surface); }
                .values-grid { display: grid; gap: 24px; }
                @media (min-width: 768px) { .values-grid { grid-template-columns: repeat(3, 1fr); gap: 32px; } }
                .value-card { background: var(--bg); padding: 32px; border-radius: 16px; text-align: center; }
                .value-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #E85D04 0%, #FF7B2E 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; }
                .value-card h3 { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
                .value-card p { font-size: 14px; line-height: 1.7; color: var(--muted); margin: 0; }

                /* Features List */
                .features-list { list-style: none; padding: 0; margin: 0; }
                .features-list li { padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 15px; line-height: 1.6; }
                .features-list li:last-child { border-bottom: none; }
                .features-list strong { color: var(--primary); }

                /* Footer */
                .footer { background: #111; color: white; padding: 48px 24px 40px; }
                @media (min-width: 768px) { .footer { padding: 80px 48px 40px; } }
                @media (min-width: 1200px) { .footer { padding: 100px 80px 48px; } }
                .footer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 32px; }
                @media (min-width: 768px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 64px; } }
                .footer-brand { grid-column: 1 / -1; margin-bottom: 16px; }
                @media (min-width: 768px) { .footer-brand { grid-column: auto; margin-bottom: 0; } }
                .footer-brand h2 { font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 0 0 8px; }
                .footer-brand > p:first-of-type { font-size: 12px; color: var(--secondary); margin: 0 0 16px; }
                .footer-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; max-width: 320px; }
                .footer-col h4 { font-size: 14px; font-weight: 600; margin: 0 0 20px; }
                .footer-col a, .footer-col :global(a) { display: block; font-size: 14px; color: rgba(255,255,255,0.6); text-decoration: none; margin-bottom: 12px; transition: color 0.2s; }
                .footer-col a:hover, .footer-col :global(a):hover { color: white; }
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
