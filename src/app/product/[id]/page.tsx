'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { ProductDetailsSkeleton, SimilarProductsSkeleton } from '@/components/Skeletons';

const Breadcrumb = dynamic(() => import('@/components/Breadcrumb'), {
    loading: () => <div className="breadcrumb-skeleton" style={{ height: '20px', width: '200px', background: '#f0f0f0', borderRadius: '4px' }}></div>,
    ssr: true
});
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useProducts, Product } from '@/contexts/product-context';
import { useAuth } from '@/contexts/auth-context';
import { useOrders } from '@/contexts/order-context';
import { StockService } from '@/services/stock-service';
import { useToast } from '@/contexts/toast-context';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { getProductById, getSimilarProducts, getDiscountPercent } = useProducts();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProduct = async () => {
            const foundProduct = await getProductById(productId);
            if (foundProduct) {
                setProduct(foundProduct);
                setSelectedSize(foundProduct.sizes[0] || null);
                setSelectedImageIndex(0);
            }
        };
        fetchProduct();
    }, [productId, getProductById]);

    // Review submission logic removed - now handled in My Orders

    if (!product) {
        return (
            <div className="page" style={{ background: '#FAFAFA', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ paddingTop: '100px' }}>
                    <ProductDetailsSkeleton />
                    <SimilarProductsSkeleton />
                </main>
            </div>
        );
    }

    const similarProducts = getSimilarProducts(product);
    const inWishlist = isInWishlist(product.id);
    const discountPercent = getDiscountPercent(product);

    const handleAddToCart = () => {
        if (!selectedSize) {
            showToast('Please select a size', 'error');
            return;
        }

        // Check stock availability only if stock tracking is enabled
        if (product.stock && !StockService.isInStock(product.stock, selectedSize)) {
            showToast('This size is out of stock', 'error');
            return;
        }

        addToCart(product);
    };

    const handleToggleWishlist = () => {
        toggleWishlist(product);
    };

    const handleSimilarProductClick = (similarProduct: Product) => {
        router.push(`/product/${similarProduct.id}`);
    };

    return (
        <div className="page">
            <Navbar />

            <main>
                {/* Breadcrumb */}
                <section className="breadcrumb-section">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Shop', href: '/shop' },
                        { label: product.category, href: `/shop?category=${product.category}` },
                        { label: product.name }
                    ]} />
                </section>

                {/* Product Content */}
                <section className="product-content">
                    {/* Image Gallery */}
                    <div className="image-gallery">
                        <div className="main-image">
                            <Image
                                src={product.images[selectedImageIndex] || product.image}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="thumbnail-row">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="100px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        {/* Tag & Rating Row */}
                        <div className="tag-rating-row">
                            {product.tag && (
                                <span className={`product-tag ${product.tag.toLowerCase()}`}>{product.tag}</span>
                            )}
                            <div className="rating">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="rating-value">{product.rating}</span>
                                <span className="review-count">({product.reviewCount} reviews)</span>
                            </div>
                        </div>

                        {/* Product Name */}
                        <h1 className="product-name">{product.name}</h1>

                        {/* Category */}
                        <p className="product-category">{product.category}</p>

                        {/* Price */}
                        <div className="price-row">
                            <span className="price">₹{product.price}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="original-price">₹{product.originalPrice}</span>
                                    <span className="discount-badge">{discountPercent}</span>
                                </>
                            )}
                        </div>

                        <div className="divider"></div>

                        {/* Size Selector */}
                        <div className="size-section">
                            <h3>Select Size</h3>
                            <div className="size-options">
                                {product.sizes.map((size) => {
                                    // If stock exists, use it; otherwise default to available
                                    const isAvailable = product.stock
                                        ? StockService.isInStock(product.stock, size)
                                        : true; // Default to available if no stock tracking

                                    return (
                                        <button
                                            key={size}
                                            className={`size-chip ${selectedSize === size ? 'selected' : ''
                                                } ${!isAvailable ? 'disabled' : ''}`}
                                            onClick={() => isAvailable && setSelectedSize(size)}
                                            disabled={!isAvailable}
                                        >
                                            <span className="size-text">{size}</span>
                                            {!isAvailable && <span className="slash-overlay"></span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="description-section">
                            <h3>Description</h3>
                            <p className={`description-text ${isDescriptionExpanded ? 'expanded' : ''}`}>
                                {product.description}
                            </p>
                            <button
                                className="read-more-btn"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            >
                                {isDescriptionExpanded ? 'Show less' : 'Read more'}
                            </button>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="desktop-actions">
                            <button
                                className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                                onClick={handleToggleWishlist}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={inWishlist ? '#E85D04' : 'none'} stroke={inWishlist ? '#E85D04' : 'currentColor'} strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock ? StockService.isOutOfStock(product.stock) : false}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {(product.stock && StockService.isOutOfStock(product.stock)) ? 'OUT OF STOCK' : 'ADD TO CART'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <section className="similar-section">
                        <h2>You May Also Like</h2>
                        <div className="similar-scroll">
                            {similarProducts.map((similarProduct) => (
                                <div
                                    key={similarProduct.id}
                                    className="similar-card"
                                    onClick={() => handleSimilarProductClick(similarProduct)}
                                >
                                    <div className="similar-image">
                                        <Image
                                            src={similarProduct.image}
                                            alt={similarProduct.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 480px) 45vw, 200px"
                                        />
                                        <button
                                            className={`similar-wishlist ${isInWishlist(similarProduct.id) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(similarProduct);
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(similarProduct.id) ? '#E85D04' : 'none'} stroke={isInWishlist(similarProduct.id) ? '#E85D04' : 'currentColor'} strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="similar-info">
                                        <h4>{similarProduct.name}</h4>
                                        <div className="similar-price-row">
                                            <span className="similar-price">₹{similarProduct.price}</span>
                                            {similarProduct.originalPrice && (
                                                <>
                                                    <span className="similar-original">₹{similarProduct.originalPrice}</span>
                                                    <span className="discount-badge">{getDiscountPercent(similarProduct)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )
                }

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
                            <Link href="/shop?category=Kurtas">Kurtas</Link>
                            <Link href="/shop?category=Hoodies">Hoodies</Link>
                            <Link href="/shop?category=Shirts">Shirts</Link>
                            <Link href="/shop?category=T-Shirts">T-Shirts</Link>
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
            </main >


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
                
                main { padding-top: 70px; padding-bottom: 100px; }
                @media (min-width: 768px) { main { padding-top: 80px; padding-bottom: 40px; } }
                @media (min-width: 1200px) { main { padding-top: 90px; } }

                .breadcrumb-section { padding: 16px 24px; background: var(--surface); border-bottom: 1px solid var(--border); }

                /* Product Content */
                .product-content { display: flex; flex-direction: column; }
                @media (min-width: 1024px) { 
                    .product-content { flex-direction: row; gap: 48px; padding: 40px 80px; } 
                }

                /* Image Gallery */
                .image-gallery { background: var(--surface); padding: 20px; }
                @media (min-width: 1024px) { 
                    .image-gallery { flex: 1; max-width: 600px; border-radius: 20px; padding: 24px; height: fit-content; position: sticky; top: 110px; } 
                }
                .main-image { position: relative; aspect-ratio: 1; border-radius: 16px; overflow: hidden; background: var(--bg); }
                .thumbnail-row { display: flex; gap: 12px; margin-top: 16px; justify-content: center; }
                .thumbnail { position: relative; width: 60px; height: 60px; border-radius: 10px; overflow: hidden; border: 2px solid var(--border); cursor: pointer; transition: border-color 0.2s; padding: 0; background: none; }
                .thumbnail.active { border-color: var(--secondary); }
                .thumbnail:hover { border-color: var(--primary); }

                /* Product Info */
                .product-info { background: var(--surface); padding: 24px; border-radius: 24px 24px 0 0; margin-top: -20px; position: relative; z-index: 1; }
                @media (min-width: 1024px) { 
                    .product-info { flex: 1; border-radius: 20px; margin-top: 0; padding: 32px; } 
                }

                /* Tag & Rating */
                .tag-rating-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
                .product-tag { padding: 6px 12px; background: var(--secondary); color: white; font-size: 10px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
                .product-tag.sale { background: #DC2626; }
                .product-tag.premium { background: linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%); }
                .product-tag.trending { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); }
                .product-tag.bestseller { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
                .rating { display: flex; align-items: center; gap: 4px; }
                .rating-value { color: var(--primary); font-size: 14px; font-weight: 600; }
                .review-count { color: var(--muted); font-size: 12px; }

                /* Product Name & Category */
                .product-name { font-size: 24px; font-weight: 700; line-height: 1.2; margin: 0 0 8px; }
                @media (min-width: 768px) { .product-name { font-size: 28px; } }
                .product-category { font-size: 14px; color: var(--muted); margin: 0 0 16px; }

                /* Price */
                .price-row { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 24px; }
                .price { font-size: 28px; font-weight: 700; color: var(--primary); }
                .original-price { font-size: 16px; color: var(--muted); text-decoration: line-through; }
                .discount-badge { padding: 4px 8px; background: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 600; border-radius: 4px; }

                .divider { height: 1px; background: var(--border); margin: 24px 0; }

                /* Size Section */
                .size-section h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px; color: var(--primary); }
                .size-options { display: flex; flex-wrap: wrap; gap: 12px; }
                .size-chip { position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 2px solid #DDD; border-radius: 12px; font-size: 16px; font-weight: 600; color: var(--primary); cursor: pointer; transition: all 0.2s; overflow: hidden; }
                .size-chip:hover { border-color: var(--primary); background: #F5F5F5; }
                .size-chip.selected { background: #1A1A1A; color: #FFFFFF; border-color: #1A1A1A; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .size-chip.disabled { 
                    opacity: 1; 
                    cursor: not-allowed; 
                    background: #F9F9F9;
                    pointer-events: none;
                    border-color: #EEE;
                    color: #BBB;
                }
                .size-text { position: relative; z-index: 1; }
                .size-chip .slash-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 140%;
                    height: 1.5px;
                    background: #BBB;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    z-index: 2;
                }

                /* Description */
                .description-section { margin-top: 24px; }
                .description-section h3 { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
                .description-text { font-size: 14px; color: var(--muted); line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
                .description-text.expanded { -webkit-line-clamp: unset; display: block; }
                .read-more-btn { background: none; border: none; color: var(--secondary); font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; margin-top: 8px; }

                /* Actions */
                .desktop-actions { display: flex; gap: 16px; margin-top: 32px; padding: 24px 0; }
                .wishlist-btn { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 2px solid var(--border); border-radius: 14px; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
                .wishlist-btn:hover { border-color: var(--secondary); background: #FFF5F0; }
                .wishlist-btn.active { background: #FFF5F0; border-color: var(--secondary); }
                .add-to-cart-btn { flex: 1; height: 60px; display: flex; align-items: center; justify-content: center; gap: 12px; background: #1A1A1A; color: #FFFFFF; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; }
                .add-to-cart-btn:hover { background: #E85D04; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232, 93, 4, 0.3); }
                .add-to-cart-btn:disabled {
                    background: #9CA3AF;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                .add-to-cart-btn:disabled:hover {
                    transform: none;
                    box-shadow: none;
                    background: #9CA3AF;
                }

                /* Similar Products */
                .similar-section { padding: 32px 24px; background: var(--surface); margin-top: 8px; }
                @media (min-width: 768px) { .similar-section { padding: 48px; } }
                @media (min-width: 1200px) { .similar-section { padding: 48px 80px; } }
                .similar-section h2 { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
                .similar-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
                .similar-scroll::-webkit-scrollbar { display: none; }
                .similar-card { flex: 0 0 160px; cursor: pointer; transition: transform 0.2s; }
                .similar-card:hover { transform: translateY(-4px); }
                .similar-image { position: relative; width: 160px; height: 140px; border-radius: 12px; overflow: hidden; background: var(--bg); }
                .similar-wishlist { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border: none; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
                .similar-wishlist:hover { transform: scale(1.1); }
                .similar-info { padding: 12px 4px; }
                .similar-info h4 { font-size: 13px; font-weight: 600; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .similar-price-row { display: flex; align-items: center; gap: 6px; }
                .similar-price { font-size: 14px; font-weight: 700; }
                .similar-original { font-size: 11px; color: var(--muted); text-decoration: line-through; }

                /* Footer */
                .footer { background: #111; color: white; padding: 48px 24px 40px; }
                @media (min-width: 768px) { .footer { padding: 80px 48px 40px; } }
                @media (min-width: 1200px) { .footer { padding: 100px 80px 48px; } }
                .reviews-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
                .reviews-grid.no-form { grid-template-columns: 1fr; }
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
        </div >
    );
}
