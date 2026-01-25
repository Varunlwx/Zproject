'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ProductGridSkeleton } from '@/components/Skeletons';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useProducts } from '@/contexts/product-context';
import { categories } from '@/data/products';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// Helper to format price with ₹ symbol (handles both "₹1,599" and "1599" formats)
const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
        return `₹${price.toLocaleString('en-IN')}`;
    }
    // If already formatted with ₹, return as-is
    if (price.includes('₹')) return price;
    // Otherwise, format the number
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''));
    return isNaN(numPrice) ? price : `₹${numPrice.toLocaleString('en-IN')}`;
};

// Helper to parse numeric price
const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    return parseInt(price.replace(/[₹,]/g, '')) || 0;
};

// Helper to calculate discount percentage
const calculateDiscount = (price: string | number, originalPrice: string | number | undefined): number => {
    if (!originalPrice) return 0;
    const current = parsePrice(price);
    const original = parsePrice(originalPrice);
    if (original <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
};

const Breadcrumb = dynamic(() => import('@/components/Breadcrumb'), {
    loading: () => <div className="breadcrumb-skeleton" style={{ height: '20px', width: '200px', background: '#f0f0f0', borderRadius: '4px' }}></div>,
    ssr: true
});

export default function ShopPage() {
    return (
        <Suspense fallback={<ShopPageSkeleton />}>
            <ShopContent />
        </Suspense>
    );
}

// Full page loading skeleton for shop
function ShopPageSkeleton() {
    return (
        <div className="page" style={{ background: '#FAFAFA', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ paddingTop: '100px' }}>
                <ProductGridSkeleton count={8} />
            </main>
        </div>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart, getCartItem } = useCart();
    const { products, loading: productsLoading } = useProducts();

    // Search suggestions logic (same as Navbar)
    const searchSuggestions = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 1) return { products: [], categories: [], subcategories: [] };

        const query = searchQuery.toLowerCase();

        // Filter products (limit to 5)
        const matchedProducts = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.subcategory.toLowerCase().includes(query) ||
            (p.tag && p.tag.toLowerCase().includes(query))
        ).slice(0, 5);

        // Filter categories
        const matchedCategories = categories.filter(c =>
            c.name.toLowerCase().includes(query)
        );

        // Filter subcategories
        const matchedSubcategories: { name: string; category: string; slug: string }[] = [];
        categories.forEach(cat => {
            cat.subcategories.forEach(sub => {
                if (sub.name.toLowerCase().includes(query)) {
                    matchedSubcategories.push({ ...sub, category: cat.name });
                }
            });
        });

        return {
            products: matchedProducts,
            categories: matchedCategories.slice(0, 3),
            subcategories: matchedSubcategories.slice(0, 4)
        };
    }, [searchQuery]);

    const hasSearchResults = searchSuggestions.products.length > 0 ||
        searchSuggestions.categories.length > 0 ||
        searchSuggestions.subcategories.length > 0;

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Navigation handlers for search suggestions
    const handleProductClick = (productId: string) => {
        router.push(`/product/${productId}`);
        setIsSearchFocused(false);
    };

    const handleCategoryClick = (categoryName: string) => {
        setSelectedCategory(categoryName);
        setSelectedSubcategory(null);
        setSearchQuery('');
        setIsSearchFocused(false);
    };

    const handleSubcategoryClick = (categoryName: string, subcategoryName: string) => {
        setSelectedCategory(categoryName);
        setSelectedSubcategory(subcategoryName);
        setSearchQuery('');
        setIsSearchFocused(false);
    };

    // Sync filters from URL
    useEffect(() => {
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');

        if (q) setSearchQuery(q);
        if (category) setSelectedCategory(category);
        if (subcategory) setSelectedSubcategory(subcategory);

        // Reset subcategory if category is All
        if (!category || category === 'All') {
            setSelectedSubcategory(null);
        }
    }, [searchParams]);

    // Main category tabs for the filter UI
    const categoryTabs = ['All', 'Tops', 'Bottoms', 'Jackets'];

    // Products imported from centralized data module

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.subcategory.toLowerCase().includes(query) ||
                (p.tag && p.tag.toLowerCase().includes(query))
            );
        }

        // Subcategory Filter (takes precedence)
        if (selectedSubcategory) {
            result = result.filter(p => p.subcategory === selectedSubcategory);
        }
        // Category Filter
        else if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Price Filter
        if (priceRange !== 'all') {
            result = result.filter(p => {
                const price = parseInt(p.price.replace(/[₹,]/g, ''));
                if (priceRange === 'under1000') return price < 1000;
                if (priceRange === '1000to2000') return price >= 1000 && price <= 2000;
                if (priceRange === '2000to3000') return price >= 2000 && price <= 3000;
                if (priceRange === 'above3000') return price > 3000;
                return true;
            });
        }

        // Sorting
        result.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[₹,]/g, ''));
            const priceB = parseInt(b.price.replace(/[₹,]/g, ''));

            if (sortBy === 'price-low') return priceA - priceB;
            if (sortBy === 'price-high') return priceB - priceA;
            if (sortBy === 'popular') return b.rating - a.rating;
            // 'newest' is default (already in some order, but we can assume original order for now)
            return 0;
        });

        return result;
    }, [searchQuery, selectedCategory, selectedSubcategory, priceRange, sortBy]);

    // Infinite scroll hook
    const { displayedItems, hasMore, loadingMore, loaderRef } = useInfiniteScroll({
        items: filteredProducts,
        batchSize: 12,
    });

    // Get page title based on filters
    const getPageTitle = () => {
        if (selectedSubcategory) return selectedSubcategory;
        if (selectedCategory !== 'All') return selectedCategory;
        return 'Shop All Products';
    };

    return (
        <div className="page">
            <Navbar />

            <main>
                {/* Page Hero */}
                <section className="shop-hero">
                    <div className="shop-hero-content">
                        <Breadcrumb items={[
                            { label: 'Home', href: '/' },
                            { label: 'Shop', href: '/shop' },
                            ...(selectedCategory !== 'All' ? [{ label: selectedCategory, href: selectedSubcategory ? `/shop?category=${selectedCategory}` : undefined }] : []),
                            ...(selectedSubcategory ? [{ label: selectedSubcategory }] : [])
                        ]} />
                        <h1>{getPageTitle()}</h1>
                        <p>Discover our premium collection of Indian menswear</p>
                    </div>
                    <div className="shop-hero-decoration"></div>
                </section>

                {/* Filter Bar */}
                <section className="filter-section">
                    <div className="search-bar" ref={searchContainerRef}>
                        <div className="search-input-wrapper">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                className="search-input"
                            />
                            {searchQuery && (
                                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                            <button className="search-btn">
                                Search
                            </button>
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {isSearchFocused && searchQuery.length > 0 && (
                            <div className="search-dropdown">
                                {hasSearchResults ? (
                                    <>
                                        {/* Products Section */}
                                        {searchSuggestions.products.length > 0 && (
                                            <div className="search-section">
                                                <p className="search-section-title">Products</p>
                                                {searchSuggestions.products.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        className="search-product-item"
                                                        onClick={() => handleProductClick(product.id)}
                                                    >
                                                        <div className="search-product-image">
                                                            <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
                                                        </div>
                                                        <div className="search-product-info">
                                                            <span className="search-product-name">{product.name}</span>
                                                            <span className="search-product-meta">{product.subcategory} • {product.price}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Categories Section */}
                                        {searchSuggestions.categories.length > 0 && (
                                            <div className="search-section">
                                                <p className="search-section-title">Categories</p>
                                                {searchSuggestions.categories.map((cat) => (
                                                    <button
                                                        key={cat.slug}
                                                        className="search-suggestion-item"
                                                        onClick={() => handleCategoryClick(cat.name)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2">
                                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                        <span>{cat.name}</span>
                                                        <span className="search-suggestion-type">in Categories</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Subcategories Section */}
                                        {searchSuggestions.subcategories.length > 0 && (
                                            <div className="search-section">
                                                <p className="search-section-title">Subcategories</p>
                                                {searchSuggestions.subcategories.map((sub, idx) => (
                                                    <button
                                                        key={`${sub.category}-${sub.slug}-${idx}`}
                                                        className="search-suggestion-item"
                                                        onClick={() => handleSubcategoryClick(sub.category, sub.name)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2">
                                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                                            <line x1="7" y1="7" x2="7.01" y2="7" />
                                                        </svg>
                                                        <span>{sub.name}</span>
                                                        <span className="search-suggestion-type">in {sub.category}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="search-no-results">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <p>No results found for &quot;{searchQuery}&quot;</p>
                                        <span>Try searching for something else</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="filter-bar">
                        <div className="category-tabs">
                            {categoryTabs.map((cat: string, idx: number) => (
                                <button
                                    key={idx}
                                    className={`category-tab ${selectedCategory === cat && !selectedSubcategory ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setSelectedSubcategory(null);
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="filter-actions">
                            <div className="filter-dropdown">
                                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                                    <option value="all">All Prices</option>
                                    <option value="under1000">Under ₹1,000</option>
                                    <option value="1000to2000">₹1,000 - ₹2,000</option>
                                    <option value="2000to3000">₹2,000 - ₹3,000</option>
                                    <option value="above3000">Above ₹3,000</option>
                                </select>
                            </div>
                            <div className="filter-dropdown">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Grid */}
                <section className="products-section">
                    <div className="products-grid">
                        {displayedItems.map((product) => (
                            <Link key={product.id} href={`/product/${product.id}`} className="product-card">
                                <div className="product-img">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
                                    />
                                    {product.tag && <span className={`product-tag ${product.tag.toLowerCase()}`}>{product.tag}</span>}
                                    <button
                                        className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            toggleWishlist(product);
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? '#E85D04' : 'none'} stroke={isInWishlist(product.id) ? '#E85D04' : 'currentColor'} strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="quick-add-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToCart(product);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                        Add to Cart
                                    </button>
                                </div>
                                <div className="product-info">
                                    <span className="product-category">{product.category}</span>
                                    <h4>{product.name}</h4>
                                    {product.rating > 0 && (
                                        <div className="product-rating">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#E85D04">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <span>{product.rating}</span>
                                            {product.reviewCount > 0 && <span className="review-count">({product.reviewCount})</span>}
                                        </div>
                                    )}
                                    <div className="price-row">
                                        <div className="price-container">
                                            <p className="price">{formatPrice(product.price)}</p>
                                            {product.originalPrice && (
                                                <>
                                                    <p className="original-price">{formatPrice(product.originalPrice)}</p>
                                                    {calculateDiscount(product.price, product.originalPrice) > 0 && (
                                                        <span className="discount-badge">{calculateDiscount(product.price, product.originalPrice)}% OFF</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <button
                                            className="price-cart-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                            </svg>
                                            {getCartItem(product.id)?.quantity && getCartItem(product.id)!.quantity > 0 && (
                                                <span className="cart-item-badge">{getCartItem(product.id)!.quantity}</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Infinite Scroll Loader */}
                    <div ref={loaderRef} className="infinite-scroll-loader">
                        {loadingMore && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <span>Loading more products...</span>
                            </div>
                        )}
                        {!hasMore && displayedItems.length > 0 && (
                            <p className="end-message">You've seen all {filteredProducts.length} products</p>
                        )}
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



        /* Shop Hero */
        main { padding-top: 70px; }
        @media (min-width: 768px) { main { padding-top: 80px; } }
        @media (min-width: 1200px) { main { padding-top: 90px; } }

        .shop-hero { position: relative; padding: 20px 24px 16px; background: var(--bg); color: var(--primary); overflow: hidden; border-bottom: 1px solid var(--border); }
        @media (min-width: 768px) { .shop-hero { padding: 24px 48px 20px; } }
        @media (min-width: 1200px) { .shop-hero { padding: 28px 80px 24px; } }
        .shop-hero-content { position: relative; z-index: 2; }
        .shop-hero-decoration { display: none; }
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 6px; }
        .breadcrumb a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .shop-hero p { font-size: 13px; color: var(--muted); margin: 0; }

        /* Filter Section */
        .filter-section { padding: 8px 24px 0; }
        @media (min-width: 768px) { .filter-section { padding: 12px 48px 0; } }
        @media (min-width: 1200px) { .filter-section { padding: 16px 80px 0; } }
        .filter-bar { display: flex; flex-direction: column; gap: 16px; }
        @media (min-width: 768px) { .filter-bar { flex-direction: row; justify-content: space-between; align-items: center; } }
        .category-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; justify-content: flex-start; margin-left: -4px; }
        .category-tabs::-webkit-scrollbar { display: none; }
        .category-tab { padding: 10px 4px; background: transparent; border: none; border-bottom: 2px solid transparent; border-radius: 0; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; color: var(--muted); margin: 0 12px; }
        .category-tab:first-child { margin-left: 0; }
        .category-tab:hover { color: var(--primary); }
        .category-tab.active { color: var(--primary); border-bottom-color: var(--secondary); font-weight: 700; }
        .filter-actions { display: flex; gap: 12px; }
        .filter-dropdown select { padding: 10px 36px 10px 16px; background: var(--surface); border: 2px solid var(--border); border-radius: 8px; font-size: 14px; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; transition: border-color 0.2s; }
        .filter-dropdown select:hover, .filter-dropdown select:focus { border-color: var(--primary); outline: none; }
        .results-count { margin-top: 24px; font-size: 14px; color: var(--muted); }

        /* Search Bar */
        .search-bar { margin-bottom: 24px; position: relative; }
        .search-input-wrapper { display: flex; align-items: center; background: var(--surface); border: 2px solid #1A1A1A; border-radius: 12px; padding: 4px; }
        .search-icon { margin-left: 16px; color: var(--muted); flex-shrink: 0; }
        .search-input { flex: 1; padding: 14px 16px; border: none; background: transparent; font-size: 15px; outline: none; }
        .search-input::placeholder { color: var(--muted); }
        .search-clear-btn { background: none; border: none; padding: 8px; cursor: pointer; color: var(--muted); display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .search-clear-btn:hover { color: var(--primary); }
        .search-btn { padding: 12px 28px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .search-btn:hover { background: var(--secondary); }
        @media (max-width: 480px) { 
          .search-btn { padding: 12px 20px; }
          .search-input { padding: 12px 12px; font-size: 14px; }
        }

        /* Search Dropdown */
        .search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); max-height: 400px; overflow-y: auto; z-index: 100; margin-top: 8px; }
        .search-section { padding: 12px 0; border-bottom: 1px solid var(--border); }
        .search-section:last-child { border-bottom: none; }
        .search-section-title { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; padding: 0 16px; margin: 0 0 8px; }
        .search-product-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 16px; background: none; border: none; cursor: pointer; text-align: left; transition: background 0.15s; }
        .search-product-item:hover { background: #F5F5F5; }
        .search-product-image { position: relative; width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--border); }
        .search-product-info { flex: 1; min-width: 0; }
        .search-product-name { display: block; font-size: 14px; font-weight: 600; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .search-product-meta { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
        .search-suggestion-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 16px; background: none; border: none; cursor: pointer; text-align: left; font-size: 14px; color: var(--primary); transition: background 0.15s; }
        .search-suggestion-item:hover { background: #F5F5F5; }
        .search-suggestion-type { margin-left: auto; font-size: 12px; color: var(--muted); }
        .search-no-results { padding: 32px 16px; text-align: center; }
        .search-no-results svg { margin-bottom: 12px; }
        .search-no-results p { font-size: 14px; color: var(--primary); margin: 0 0 4px; }
        .search-no-results span { font-size: 12px; color: var(--muted); }

        /* Products Section */
        .products-section { padding: 32px 24px; }
        @media (min-width: 768px) { .products-section { padding: 40px 48px; } }
        @media (min-width: 1200px) { .products-section { padding: 48px 80px; } }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 768px) { .products-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; } }
        .product-card { text-decoration: none; color: var(--primary); transition: transform 0.2s; background: var(--surface); border-radius: 24px; overflow: hidden; }
        .product-card:hover { transform: translateY(-4px); }
        .product-img { position: relative; aspect-ratio: 3/4; border-radius: 24px; overflow: hidden; margin-bottom: 0; background: var(--border); }
        .product-img img { transition: transform 0.4s; border-radius: 24px; }
        .product-card:hover .product-img img { transform: scale(1.08); }
        .product-tag { position: absolute; top: 12px; left: 12px; padding: 6px 12px; background: #1A1A1A; color: white; font-size: 10px; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
        .product-tag.sale { background: #DC2626; }
        .product-tag.premium { background: linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%); }
        .product-tag.trending { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); }
        .product-tag.new { background: #E85D04; }
        .wishlist-btn { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; background: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; opacity: 1; z-index: 2; }
        .wishlist-btn.active { background: white; }
        .wishlist-btn:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
        .wishlist-btn:hover svg { stroke: #DC2626; }
        .product-info { padding: 16px; background: var(--surface); }
        .product-category { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; display: none; }
        .product-info h4 { font-size: 15px; font-weight: 600; margin: 0 0 8px; color: var(--primary); }
        .product-rating { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
        .product-rating span { font-size: 12px; font-weight: 600; color: var(--primary); }
        .review-count { font-weight: 400; color: var(--muted); }
        .price-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .price-container { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .price { font-size: 17px; font-weight: 700; color: var(--secondary); margin: 0; }
        .original-price { font-size: 13px; color: var(--muted); text-decoration: line-through; margin: 0; }
        .discount-badge { font-size: 11px; font-weight: 700; color: #16A34A; background: #DCFCE7; padding: 2px 6px; border-radius: 4px; }
        .price-cart-btn { position: relative; width: 40px; height: 36px; background: #1A1A1A; color: white; border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .price-cart-btn:hover { background: #333; transform: scale(1.05); }
        .cart-item-badge { position: absolute; top: -8px; right: -8px; background: var(--secondary); color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 2px; border: 2px solid var(--surface); }

        /* Load More */
        .load-more-section { text-align: center; padding: 0 24px 48px; }
        @media (min-width: 768px) { .load-more-section { padding: 0 48px 64px; } }
        .load-more-btn { padding: 16px 48px; background: transparent; border: 2px solid var(--primary); color: var(--primary); font-size: 14px; font-weight: 600; letter-spacing: 1px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .load-more-btn:hover { background: var(--primary); color: white; }

        /* Newsletter Section */
        .newsletter-section { padding: 64px 24px; background: linear-gradient(135deg, var(--secondary) 0%, #D54F00 100%); color: white; text-align: center; }
        @media (min-width: 768px) { .newsletter-section { padding: 80px 48px; } }
        .newsletter-content { max-width: 500px; margin: 0 auto; }
        .newsletter-tag { display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; letter-spacing: 2px; border-radius: 20px; margin-bottom: 16px; }
        .newsletter-section h2 { font-size: 28px; font-weight: 700; margin: 0 0 12px; }
        @media (min-width: 768px) { .newsletter-section h2 { font-size: 36px; } }
        .newsletter-section p { font-size: 15px; opacity: 0.9; margin: 0 0 28px; line-height: 1.6; }
        .newsletter-form { display: flex; gap: 12px; max-width: 400px; margin: 0 auto; }
        @media (max-width: 480px) { .newsletter-form { flex-direction: column; } }
        .newsletter-form input { flex: 1; padding: 14px 20px; border: none; border-radius: 8px; font-size: 14px; outline: none; }
        .newsletter-form button { padding: 14px 28px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .newsletter-form button:hover { background: #333; }

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

        /* Infinite Scroll Loader */
        .infinite-scroll-loader { padding: 32px 0; text-align: center; }
        .loading-spinner { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--secondary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-spinner span { font-size: 14px; color: var(--muted); }
        .end-message { font-size: 14px; color: var(--muted); margin: 0; }
      `}</style>
        </div>
    );
}
