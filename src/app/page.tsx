'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useReviews } from '@/hooks/useReviews';

const ReviewCard = dynamic(() => import('@/components/ReviewCard'), {
  loading: () => <div className="review-card-skeleton" style={{ minWidth: '300px', height: '200px', background: '#eee', borderRadius: '12px' }}></div>,
  ssr: true
});

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, getCartItem } = useCart();
  const { reviews, loading: reviewsLoading } = useReviews();

  // Fallback reviews when no dynamic reviews exist
  const FALLBACK_REVIEWS = [
    {
      id: 'fallback-1',
      productName: 'Royal Silk Kurta',
      productImage: '/images/products/Kurta.jpg',
      rating: 5,
      comment: 'Absolutely stunning! The silk quality is exceptional and the fit is perfect. Wore it to a wedding and received countless compliments.',
      userName: 'Rahul Kumar',
      verified: false,
      images: [],
      createdAt: null
    },
    {
      id: 'fallback-2',
      productName: 'Classic Hoodie',
      productImage: '/images/products/Hoddie-1.jpg',
      rating: 5,
      comment: 'Super comfortable and warm. The material is premium quality and the design is sleek. Perfect for winter!',
      userName: 'Arjun Patel',
      verified: false,
      images: [],
      createdAt: null
    },
    {
      id: 'fallback-3',
      productName: 'Formal Shirt',
      productImage: '/images/products/Shirt-1.jpg',
      rating: 4,
      comment: 'Great quality shirt. The fabric is breathable and the stitching is excellent. Highly recommend for office wear.',
      userName: 'Vikram Singh',
      verified: false,
      images: [],
      createdAt: null
    },
    {
      id: 'fallback-4',
      productName: 'Premium T-Shirt',
      productImage: '/images/products/Tshirt-1.jpg',
      rating: 5,
      comment: 'Best t-shirt I have bought! The cotton is so soft and it fits perfectly. Will definitely buy more.',
      userName: 'Amit Sharma',
      verified: false,
      images: [],
      createdAt: null
    },
    {
      id: 'fallback-5',
      productName: 'Casual Shirt',
      productImage: '/images/products/Shirt-2.jpg',
      rating: 5,
      comment: 'Excellent casual wear. The color and pattern are exactly as shown. Very happy with the purchase!',
      userName: 'Rohan Mehta',
      verified: false,
      images: [],
      createdAt: null
    }
  ];

  // Merge dynamic reviews with fallback reviews (dynamic first)
  const allReviews = [
    ...reviews.map(r => ({
      id: r.id,
      productName: r.productName || 'ZCLOTHS Item',
      productImage: r.productImage || '/images/products/placeholder.jpg',
      rating: r.rating,
      comment: r.comment,
      userName: r.userName,
      verified: r.verified,
      images: r.images || []
    })),
    ...FALLBACK_REVIEWS
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Kurtas', image: '/images/categories/Kurta.jpg' },
    { name: 'Hoodies', image: '/images/categories/Hoddie-1.jpg' },
    { name: 'Shirts', image: '/images/categories/Shirt-1.jpg' },
    { name: 'T-Shirts', image: '/images/categories/Tshirt-1.jpg' },
  ];

  const collections = [
    { name: 'Festive Collection', subtitle: 'Traditional Elegance', image: '/images/collections/Kurta.jpg' },
    { name: 'Winter Essentials', subtitle: 'Stay Warm in Style', image: '/images/collections/Hoddie-2.jpg' },
  ];

  const newArrivals = [
    { id: 'kurta-1', name: 'Royal Silk Kurta', price: '₹2,499', originalPrice: '₹2,999', tag: 'New', image: '/images/products/Kurta.jpg' },
    { id: 'hoodie-1', name: 'Classic Hoodie', price: '₹1,899', originalPrice: '₹2,499', tag: 'Trending', image: '/images/products/Hoddie-1.jpg' },
    { id: 'hoodie-2', name: 'Premium Hoodie', price: '₹2,199', originalPrice: '', tag: '', image: '/images/products/Hoddie-2.jpg' },
    { id: 'shirt-1', name: 'Formal Shirt', price: '₹1,599', originalPrice: '₹1,999', tag: 'Bestseller', image: '/images/products/Shirt-1.jpg' },
    { id: 'shirt-2', name: 'Casual Shirt', price: '₹1,399', originalPrice: '', tag: '', image: '/images/products/Shirt-2.jpg' },
    { id: 'tshirt-1', name: 'Premium T-Shirt', price: '₹999', originalPrice: '₹1,299', tag: 'New', image: '/images/products/Tshirt-1.jpg' },
  ];

  // Helper to calculate discount percentage for inline data
  const calculateDiscount = (price: string, original: string) => {
    if (!original) return null;
    const p = parseInt(price.replace(/[₹,]/g, ''));
    const o = parseInt(original.replace(/[₹,]/g, ''));
    return Math.round(((o - p) / o) * 100) + '% OFF';
  };

  const occasions = [
    { name: 'Wedding', image: '/images/products/Kurta.jpg' },
    { name: 'Casual', image: '/images/products/Tshirt-1.jpg' },
    { name: 'Festive', image: '/images/products/Shirt-1.jpg' },
    { name: 'Office', image: '/images/products/Shirt-2.jpg' },
  ];

  const trendingTags = ['Silk Kurtas', 'Winter Hoodies', 'Ethnic Wear', 'Casual Shirts', 'Wedding Collection', 'Premium Cotton'];

  return (
    <div className="page">
      {/* Header - Logo left, rest right */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg">
            <Image
              src="/images/banners/Hero-image.jpg"
              alt="New Collection"
              fill
              style={{ objectFit: 'cover' }}
              priority
              quality={90}
              sizes="100vw"
            />
          </div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p>Handcrafted Indian menswear for the modern gentleman. Premium fabrics, timeless designs.</p>
            <div className="hero-buttons">
              <Link href="/shop" style={{ textDecoration: 'none' }}>
                <span className="hero-btn">SHOP NOW</span>
              </Link>
              <Link href="/shop" style={{ textDecoration: 'none' }}>
                <span className="hero-btn">EXPLORE COLLECTION</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="categories">
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <Link key={idx} href="/shop" className="category-card">
                <div className="category-img">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Collections */}
        <section className="section">
          <div className="section-header">
            <div>
              <h3>Featured Collections</h3>
              <p className="section-subtitle">Curated styles for every occasion</p>
            </div>
            <Link href="/shop" className="view-all">View All</Link>
          </div>
          <div className="collections-grid">
            {collections.map((col, idx) => (
              <Link key={idx} href="/shop" style={{ textDecoration: 'none' }}>
                <div className="collection-card">
                  <div className="collection-img">
                    <Image
                      src={col.image}
                      alt={col.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="collection-overlay"></div>
                  <div className="collection-info">
                    <h4>{col.name}</h4>
                    <p>{col.subtitle}</p>
                    <span className="collection-cta">Shop Now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        {/* New Arrivals */}
        <section className="section">
          <div className="section-header">
            <div>
              <h3>New Arrivals</h3>
              <p className="section-subtitle">Fresh styles just dropped</p>
            </div>
            <a href="#" className="view-all">View All </a>
          </div>
          <div className="products-grid">
            {newArrivals.map((product) => (
              <Link key={product.id} href="/shop" className="product-card">
                <div className="product-img">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  {product.tag && <span className="product-tag">{product.tag}</span>}
                  <button
                    className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product as any);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? '#E85D04' : 'none'} stroke={isInWishlist(product.id) ? '#E85D04' : 'currentColor'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <div className="price-row">
                    <div className="price-container">
                      <p className="price">{product.price}</p>
                      {product.originalPrice && (
                        <>
                          <p className="original-price">{product.originalPrice}</p>
                          <span className="discount-badge">{calculateDiscount(product.price, product.originalPrice)}</span>
                        </>
                      )}
                    </div>
                    <button
                      className="price-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Create a full product object for addToCart
                        const fullProduct = {
                          ...product,
                          category: 'Collections',
                          subcategory: '',
                          images: [product.image],
                          rating: 5,
                          reviewCount: 0,
                          description: '',
                          sizes: ['S', 'M', 'L', 'XL'],
                          originalPrice: product.price // Using same for now
                        };
                        addToCart(fullProduct as any);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Shop by Occasion */}
        <section className="section occasions-section">
          <div className="section-header center">
            <h3>Shop by Occasion</h3>
            <p className="section-subtitle">Find the perfect outfit for every moment</p>
          </div>
          <div className="occasions-grid">
            {occasions.map((occ, idx) => (
              <Link key={idx} href="/shop" style={{ textDecoration: 'none' }}>
                <div className="occasion-card">
                  <div className="occasion-img">
                    <Image
                      src={occ.image}
                      alt={occ.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 480px) 50vw, 25vw"
                    />
                  </div>
                  <div className="occasion-overlay"></div>
                  <span>{occ.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section className="section">
          <div className="section-header center">
            <h3>Trending Now</h3>
            <p className="section-subtitle">Discover what is popular</p>
          </div>
          <div className="tags-wrap">
            {trendingTags.map((tag, idx) => (
              <a key={idx} href="#" className="trending-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                </svg>
                {tag}
              </a>
            ))}
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="section reviews-section">
          <div className="section-header center">
            <h3>What Our Customers Say</h3>
            <p className="section-subtitle">Real reviews from verified purchases</p>
          </div>
          <div className="reviews-container">
            <div className="reviews-scroll">
              {allReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  productName={review.productName}
                  productImage={review.productImage}
                  rating={review.rating}
                  comment={review.comment}
                  userName={review.userName}
                  verified={review.verified}
                  images={review.images}
                />
              ))}
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
              <Link href="/about">About Us</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p> 2024 Zcloths. All rights reserved.</p>
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

        .avatar-initial { color: white; font-size: 16px; font-weight: 700; text-transform: uppercase; }

        /* Hero */
        .hero { position: relative; height: 500px; overflow: hidden; width: 100%; }
        @media (min-width: 768px) { .hero { height: 600px; } }
        @media (min-width: 1024px) { .hero { height: 90vh; min-height: 600px; max-height: 900px; } }
        .hero-bg { position: absolute; inset: 0; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%); }
        @media (max-width: 767px) { .hero-overlay { background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%); } }
        .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px 24px 60px; color: white; }
        @media (min-width: 768px) { .hero-content { top: 50%; bottom: auto; transform: translateY(-50%); max-width: 600px; padding: 0 48px; } }
        @media (min-width: 1200px) { .hero-content { padding: 0 80px; max-width: 700px; } }
        .hero-tag { display: inline-block; padding: 8px 16px; background: var(--secondary); font-size: 11px; font-weight: 700; letter-spacing: 2px; border-radius: 4px; margin-bottom: 20px; }
        .hero-content h2 { font-size: 40px; font-weight: 300; line-height: 1.1; margin: 0 0 16px; }
        @media (min-width: 768px) { .hero-content h2 { font-size: 56px; } }
        @media (min-width: 1024px) { .hero-content h2 { font-size: 72px; } }
        .hero-content p { font-size: 15px; opacity: 0.85; margin: 0 0 28px; max-width: 400px; line-height: 1.6; }
        .hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-btn { 
          padding: 14px 28px; 
          font-size: 12px; 
          font-weight: 600; 
          letter-spacing: 1.5px; 
          border-radius: 6px; 
          cursor: pointer; 
          transition: all 0.2s; 
          background: transparent; 
          color: white; 
          border: 1.5px solid white; 
          display: inline-block; 
          text-decoration: none; 
          text-align: center;
        }
        .hero-btn:hover { background: white; color: var(--primary); }

        /* Categories */
        .categories { padding: 48px 24px; }
        @media (min-width: 768px) { .categories { padding: 64px 48px; } }
        @media (min-width: 1200px) { .categories { padding: 80px; } }
        .categories-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (min-width: 768px) { .categories-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; } }
        .category-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; text-decoration: none; color: var(--primary); }
        .category-img { position: relative; width: 100%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; border: 3px solid var(--border); transition: border-color 0.2s, transform 0.2s; }
        .category-card:hover .category-img { border-color: var(--secondary); transform: scale(1.05); }
        .category-card span { font-size: 14px; font-weight: 600; display: block; width: 100%; }

        /* Sections */
        .section { padding: 48px 24px; }
        @media (min-width: 768px) { .section { padding: 72px 48px; } }
        @media (min-width: 1200px) { .section { padding: 80px; } }
        .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .section-header.center { flex-direction: column; align-items: center; text-align: center; }
        .section-header h3 { font-size: 24px; font-weight: 700; margin: 0; }
        @media (min-width: 768px) { .section-header h3 { font-size: 32px; } }
        .section-subtitle { font-size: 14px; color: var(--muted); margin: 6px 0 0; }
        .view-all { color: var(--secondary); font-size: 14px; font-weight: 600; text-decoration: none; }
        .view-all:hover { text-decoration: underline; }

        /* Collections */
        .collections-grid { display: grid; gap: 20px; }
        @media (min-width: 768px) { .collections-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; } }
        .collection-card { position: relative; height: 300px; border-radius: 16px; overflow: hidden; text-decoration: none; color: white; }
        @media (min-width: 768px) { .collection-card { height: 400px; } }
        @media (min-width: 1200px) { .collection-card { height: 500px; } }
        .collection-img { position: absolute; inset: 0; transition: transform 0.4s; }
        .collection-card:hover .collection-img { transform: scale(1.05); }
        .collection-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%); }
        .collection-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 32px; }
        .collection-info h4 { font-size: 24px; font-weight: 600; margin: 0 0 4px; }
        .collection-info p { font-size: 14px; opacity: 0.8; margin: 0 0 12px; }
        .collection-cta { font-size: 13px; font-weight: 600; color: var(--secondary); }

        /* Products */
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 768px) { .products-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; } }
        @media (min-width: 1400px) { .products-grid { grid-template-columns: repeat(6, 1fr); } }
        .product-card { text-decoration: none; color: var(--primary); transition: transform 0.2s; background: var(--surface); border-radius: 24px; overflow: hidden; }
        .product-img { position: relative; aspect-ratio: 3/4; border-radius: 24px; overflow: hidden; margin-bottom: 0; background: #f5f5f5; }
        .product-img img { transition: transform 0.4s; }
        .product-card:hover .product-img img { transform: scale(1.05); }
        .product-tag { position: absolute; top: 12px; left: 12px; padding: 6px 12px; background: #1A1A1A; color: white; font-size: 10px; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
        .product-tag.sale { background: #DC2626; }
        .product-tag.trending { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); }
        .product-tag.new, .product-tag.bestseller { background: #E85D04; }
        .wishlist-btn { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; background: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; z-index: 2; }
        .wishlist-btn:hover { transform: scale(1.1); }
        .wishlist-btn.active { background: white; }
        .product-info { padding: 16px; background: var(--surface); }
        .product-info h4 { font-size: 15px; font-weight: 600; margin: 0 0 12px; color: var(--primary); }
        .price-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .price { font-size: 17px; font-weight: 700; color: var(--secondary); margin: 0; }
        .price-cart-btn { position: relative; width: 40px; height: 36px; background: #1A1A1A; color: white; border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .price-cart-btn:hover { background: #333; transform: scale(1.05); }
        .cart-item-badge { position: absolute; top: -8px; right: -8px; background: var(--secondary); color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 2px; border: 2px solid white; }

        /* Occasions */
        .occasions-section { background: var(--surface); }
        .occasions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 768px) { .occasions-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; } }
        .occasion-card { position: relative; aspect-ratio: 1; border-radius: 16px; overflow: hidden; text-decoration: none; display: flex; align-items: center; justify-content: center; }
        .occasion-img { position: absolute; inset: 0; transition: transform 0.3s; }
        .occasion-card:hover .occasion-img { transform: scale(1.1); }
        .occasion-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
        .occasion-card span { position: relative; color: white; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }

        /* Trending */
        .tags-wrap { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
        .trending-tag { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--surface); border: 2px solid var(--primary); border-radius: 24px; font-size: 14px; font-weight: 500; color: var(--primary); text-decoration: none; transition: all 0.2s; }
        .trending-tag:hover { border-color: var(--secondary); color: var(--secondary); }
        .trending-tag svg { color: var(--secondary); }

        /* Reviews Section */
        .reviews-section { background: var(--surface); overflow: hidden; }
        .reviews-container { position: relative; width: 100%; overflow: hidden; }
        .reviews-scroll { 
          display: flex; 
          gap: 20px; 
          overflow-x: auto; 
          scroll-behavior: smooth;
          padding-bottom: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .reviews-scroll::-webkit-scrollbar { height: 8px; }
        .reviews-scroll::-webkit-scrollbar-track { background: transparent; }
        .reviews-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .reviews-scroll::-webkit-scrollbar-thumb:hover { background: var(--muted); }
        
        @media (min-width: 768px) {
          .reviews-scroll { gap: 24px; }
        }
        

        /* Footer */
        .footer { background: #111; color: white; padding: 48px 24px 40px; }
        @media (min-width: 768px) { .footer { padding: 80px 48px 40px; } }
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
      <style jsx global>{`
        .category-card { 
          display: flex !important; 
          flex-direction: column !important; 
          align-items: center !important; 
          text-align: center !important;
          width: 100%;
        }
        .category-card span { 
          font-size: 14px; 
          font-weight: 600; 
          display: block !important; 
          width: 100% !important; 
          text-align: center !important;
        }
      `}</style>
    </div >
  );
}

