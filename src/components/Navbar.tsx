'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useProducts } from '@/contexts/product-context';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { categories } from '@/data/products';

export default function Navbar() {
    const { user, loading } = useAuth();
    const { wishlistCount } = useWishlist();
    const { cartCount } = useCart();
    const { products } = useProducts();
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Search suggestions logic
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path: string) => pathname === path;

    const handleMenuClose = () => setIsMenuOpen(false);
    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleProductClick = (productId: string) => {
        router.push(`/product/${productId}`);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const handleSubcategoryClick = (categoryName: string, subcategoryName: string) => {
        router.push(`/shop?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}`);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-left">
                    <button
                        className="menu-btn mobile-only"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <Link href="/" className="logo">
                        <h1>ZCLOTHS</h1>
                    </Link>
                </div>

                <div className="header-right">
                    <nav className="desktop-nav desktop-only">
                        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                        <Link href="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>Shop</Link>
                        <Link href="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About Us</Link>
                        <div
                            className="nav-dropdown-container"
                            onMouseEnter={() => setActiveDropdown('categories')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="nav-link nav-dropdown-trigger">
                                Categories
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            <div className={`nav-mega-dropdown ${activeDropdown === 'categories' ? 'open' : ''}`}>
                                {categories.map((cat) => (
                                    <div key={cat.slug} className="nav-mega-category">
                                        <Link
                                            href={`/shop?category=${encodeURIComponent(cat.name)}`}
                                            className="nav-mega-category-title"
                                            style={{ color: '#1A1A1A' }}
                                            onClick={() => setActiveDropdown(null)}
                                        >
                                            {cat.name}
                                        </Link>
                                        <div className="nav-mega-subcategories">
                                            {cat.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.slug}
                                                    href={`/shop?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                                    className="nav-mega-subcategory-link"
                                                    style={{ color: '#6B6B6B' }}
                                                    onClick={() => setActiveDropdown(null)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </nav>

                    <div className="header-actions">
                        {/* Inline Search */}
                        <div className={`inline-search-container ${isSearchOpen ? 'open' : ''}`} ref={searchContainerRef}>
                            {!isSearchOpen ? (
                                <button className="icon-btn" onClick={toggleSearch} aria-label="Search">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </button>
                            ) : (
                                <div className="inline-search-wrapper">
                                    <form className="inline-search-form" onSubmit={handleSearchSubmit}>
                                        <svg className="inline-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Search for products, brands and more"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="inline-search-input"
                                        />
                                        {searchQuery && (
                                            <button type="button" className="inline-search-clear" onClick={() => setSearchQuery('')}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                        <button type="button" className="inline-search-close" onClick={toggleSearch}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </form>
                                    {/* Search Dropdown Results */}
                                    {hasSearchResults || searchQuery.length > 0 ? (
                                        <div className="inline-search-dropdown">
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

                                                    {/* View All Results */}
                                                    <button className="search-view-all" onClick={handleSearchSubmit}>
                                                        View all results for "{searchQuery}"
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                                        </svg>
                                                    </button>
                                                </>
                                            ) : searchQuery.length > 0 ? (
                                                <div className="search-no-results">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                    </svg>
                                                    <p>No results found for "{searchQuery}"</p>
                                                    <span>Try searching for something else</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div className="inline-search-dropdown">
                                            <div className="search-popular">
                                                <p className="search-section-title">Popular Searches</p>
                                                <div className="search-popular-tags">
                                                    <button onClick={() => { setSearchQuery('Shirt'); }}>Shirts</button>
                                                    <button onClick={() => { setSearchQuery('Jacket'); }}>Jackets</button>
                                                    <button onClick={() => { setSearchQuery('Pant'); }}>Pants</button>
                                                    <button onClick={() => { setSearchQuery('Cargo'); }}>Cargos</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <Link href="/wishlist" className="icon-btn wishlist-btn-nav desktop-only">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
                        </Link>
                        <Link href="/cart" className="icon-btn cart-btn">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                        {!loading && (
                            user ? (
                                <Link href="/profile" style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E85D04', marginLeft: '8px', textDecoration: 'none' }}>
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: 'white', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{user.displayName?.[0] || user.email?.[0] || 'U'}</span>
                                    )}
                                </Link>
                            ) : (
                                <Link href="/login" className="login-btn desktop-only">Sign In</Link>
                            )
                        )}
                    </div>
                </div>
            </header>



            {/* Mobile Menu Overlay */}
            <div
                className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}
                onClick={handleMenuClose}
                aria-hidden="true"
            />

            {/* Mobile Menu Drawer */}
            <nav className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <Link href="/" className="mobile-menu-logo" onClick={handleMenuClose}>
                        <h2>ZCLOTHS</h2>
                        <p>INDIAN MENSWEAR</p>
                    </Link>
                    <button
                        className="mobile-menu-close"
                        onClick={handleMenuClose}
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="mobile-menu-content">
                    <div className="mobile-menu-section">
                        <span className="mobile-menu-section-title">Menu</span>
                        <Link
                            href="/"
                            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                            onClick={handleMenuClose}
                        >
                            <span className="mobile-nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </span>
                            <span className="mobile-nav-text">Home</span>
                        </Link>
                        <Link
                            href="/shop"
                            className={`mobile-nav-link ${isActive('/shop') ? 'active' : ''}`}
                            onClick={handleMenuClose}
                        >
                            <span className="mobile-nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                                </svg>
                            </span>
                            <span className="mobile-nav-text">Shop All</span>
                        </Link>
                        <Link
                            href="/about"
                            className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
                            onClick={handleMenuClose}
                        >
                            <span className="mobile-nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </span>
                            <span className="mobile-nav-text">About Us</span>
                        </Link>
                    </div>

                    {/* Categories Section */}
                    <div className="mobile-menu-section">
                        <span className="mobile-menu-section-title">Categories</span>
                        {categories.map((cat) => (
                            <div key={cat.slug} className="mobile-category-accordion">
                                <button
                                    className={`mobile-category-header ${expandedMobileCategory === cat.slug ? 'expanded' : ''}`}
                                    onClick={() => setExpandedMobileCategory(expandedMobileCategory === cat.slug ? null : cat.slug)}
                                >
                                    <span className="mobile-nav-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {cat.slug === 'tops' && <><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /></>}
                                            {cat.slug === 'bottoms' && <><path d="M18 3H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><path d="M6 8v11a2 2 0 0 0 2 2h2l1-6h2l1 6h2a2 2 0 0 0 2-2V8" /></>}
                                            {cat.slug === 'jackets' && <><path d="M16 3h2a2 2 0 0 1 2 2v1a1 1 0 0 0 1 1h0a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2h-4" /><path d="M8 3H6a2 2 0 0 0-2 2v1a1 1 0 0 1-1 1h0a1 1 0 0 0-1 1v9a2 2 0 0 0 2 2h4" /><path d="M12 3v18" /><path d="M8 3l4 6 4-6" /></>}
                                        </svg>
                                    </span>
                                    <span className="mobile-nav-text">{cat.name}</span>
                                    <svg className="mobile-category-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                <div className={`mobile-category-content ${expandedMobileCategory === cat.slug ? 'expanded' : ''}`}>
                                    {cat.subcategories.map((sub) => (
                                        <Link
                                            key={sub.slug}
                                            href={`/shop?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                            className="mobile-subcategory-link"
                                            onClick={handleMenuClose}
                                        >
                                            <span className="subcategory-bullet">•</span>
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>


                    <div className="mobile-menu-section">
                        <span className="mobile-menu-section-title">Your Account</span>
                        <Link
                            href="/wishlist"
                            className={`mobile-nav-link ${isActive('/wishlist') ? 'active' : ''}`}
                            onClick={handleMenuClose}
                        >
                            <span className="mobile-nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </span>
                            <span className="mobile-nav-text">Wishlist</span>
                            {wishlistCount > 0 && <span className="mobile-badge">{wishlistCount}</span>}
                        </Link>
                        <Link
                            href="/cart"
                            className={`mobile-nav-link ${isActive('/cart') ? 'active' : ''}`}
                            onClick={handleMenuClose}
                        >
                            <span className="mobile-nav-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </span>
                            <span className="mobile-nav-text">Cart</span>
                            {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
                        </Link>
                    </div>

                    <div className="mobile-menu-user-section">
                        {!loading && (
                            user ? (
                                <Link
                                    href="/profile"
                                    className="mobile-profile-card"
                                    onClick={handleMenuClose}
                                >
                                    <div className="mobile-profile-avatar">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" />
                                        ) : (
                                            <span>{user.displayName?.[0] || user.email?.[0] || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="mobile-profile-info">
                                        <span className="mobile-profile-name">{user.displayName || 'User'}</span>
                                        <span className="mobile-profile-email">{user.email}</span>
                                    </div>
                                    <svg className="mobile-profile-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="mobile-sign-in-btn"
                                    onClick={handleMenuClose}
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </nav>

            <style jsx>{`
                .mobile-only { display: flex; }
                .desktop-only { display: none; }
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                    .desktop-only { display: flex; }
                }

                .header { 
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    right: 0; 
                    z-index: 1000; 
                    background: transparent;
                    border-bottom: 1px solid transparent; 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    padding: 16px 24px; 
                    transition: all 0.3s ease;
                    color: ${pathname === '/' && !isScrolled ? 'white' : 'var(--primary)'};
                }
                
                .header.scrolled { 
                    background: #FFFFFF;
                    border-bottom: 1px solid #E5E5E5; 
                    padding: 12px 24px;
                    color: var(--primary);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                @media (min-width: 768px) { 
                    .header { padding: 24px 48px; } 
                    .header.scrolled { padding: 16px 48px; }
                }
                @media (min-width: 1200px) { 
                    .header { padding: 30px 80px; } 
                    .header.scrolled { padding: 20px 80px; }
                }

                .header-left { display: flex; align-items: center; gap: 16px; }
                .header-right { display: flex; align-items: center; gap: 32px; }
                .menu-btn, .icon-btn { background: none; border: none; padding: 8px; cursor: pointer; color: inherit; transition: color 0.2s; }
                .menu-btn:hover, .icon-btn:hover { color: #E85D04; }
                .desktop-nav { display: none; gap: 32px; }
                @media (min-width: 768px) { .desktop-nav { display: flex; } }
                .nav-link { text-decoration: none; color: inherit; font-size: 14px; font-weight: 500; transition: color 0.2s; }
                .nav-link:hover, .nav-link.active { color: #E85D04; }

                /* Desktop Category Dropdowns */
                .nav-dropdown-container { position: relative; }
                .nav-dropdown-trigger { display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; font-family: inherit; }
                .nav-dropdown-trigger svg { transition: transform 0.2s; }
                .nav-dropdown-container:hover .nav-dropdown-trigger svg { transform: rotate(180deg); }
                .nav-dropdown { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); min-width: 180px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 8px 0; opacity: 0; visibility: hidden; transition: all 0.2s ease; margin-top: 16px; z-index: 1001; }
                .nav-dropdown::before { content: ''; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); border: 8px solid transparent; border-bottom-color: white; }
                .nav-dropdown.open { opacity: 1; visibility: visible; margin-top: 8px; }
                .nav-dropdown-item { display: block; padding: 12px 20px; color: #1A1A1A; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s; }
                .nav-dropdown-item:hover { background: #F5F5F5; color: #E85D04; padding-left: 24px; }

                /* Mega Dropdown for Categories */
                .nav-mega-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 32px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
                    padding: 24px 32px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.25s ease;
                    margin-top: 20px;
                    z-index: 1001;
                }
                .nav-mega-dropdown::before {
                    content: '';
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 8px solid transparent;
                    border-bottom-color: white;
                }
                .nav-mega-dropdown.open {
                    opacity: 1;
                    visibility: visible;
                    margin-top: 10px;
                }
                .nav-mega-category {
                    min-width: 140px;
                }
                .nav-mega-category-title {
                    display: block;
                    font-size: 14px;
                    font-weight: 700;
                    color: #1A1A1A !important;
                    text-decoration: none;
                    padding-bottom: 12px;
                    margin-bottom: 8px;
                    border-bottom: 2px solid #E85D04;
                    transition: color 0.2s;
                }
                .nav-mega-category-title:hover {
                    color: #E85D04 !important;
                }
                .nav-mega-subcategories {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .nav-mega-subcategory-link {
                    display: block;
                    padding: 8px 0;
                    color: #6B6B6B !important;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.15s;
                }
                .nav-mega-subcategory-link:hover {
                    color: #E85D04 !important;
                    padding-left: 8px;
                }
                .logo { text-decoration: none; color: inherit; text-align: left; }
                .logo h1 { font-size: 20px; font-weight: 700; letter-spacing: 5px; margin: 0; }
                @media (min-width: 768px) { .logo h1 { font-size: 26px; letter-spacing: 8px; } }
                .logo p { font-size: 8px; letter-spacing: 3px; color: inherit; opacity: 0.7; margin: 2px 0 0; }
                .header-actions { display: flex; align-items: center; gap: 8px; }
                .icon-btn { display: inline-flex; align-items: center; justify-content: center; position: relative; }
                :global(.cart-btn) { position: relative !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
                :global(.cart-badge) { position: absolute !important; top: -4px !important; right: -4px !important; min-width: 18px; height: 18px; padding: 0 5px; background: #E85D04; color: white; font-size: 11px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 100; pointer-events: none; line-height: 1; }
                :global(.wishlist-btn-nav) { position: relative !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
                :global(.wishlist-badge) { position: absolute !important; top: -4px !important; right: -4px !important; min-width: 18px; height: 18px; padding: 0 5px; background: #E85D04; color: white; font-size: 11px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 100; pointer-events: none; line-height: 1; }
                
                .login-btn { 
                    padding: 10px 20px; 
                    background: ${pathname === '/' && !isScrolled ? 'transparent' : '#1A1A1A'}; 
                    color: ${pathname === '/' && !isScrolled ? 'white' : 'white'}; 
                    border: ${pathname === '/' && !isScrolled ? '1.5px solid white' : '1.5px solid transparent'};
                    text-decoration: none; 
                    font-size: 13px; 
                    font-weight: 600; 
                    border-radius: 6px; 
                    transition: all 0.2s; 
                    margin-left: 8px; 
                }
                .login-btn:hover { 
                    background: ${pathname === '/' && !isScrolled ? 'white' : '#333'}; 
                    color: ${pathname === '/' && !isScrolled ? '#1A1A1A' : 'white'}; 
                    transform: translateY(-1px); 
                }

                /* Inline Search Container Styles */
                .inline-search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .inline-search-wrapper {
                    position: absolute;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    z-index: 1100;
                    animation: searchExpand 0.2s ease-out;
                }
                @keyframes searchExpand {
                    from {
                        opacity: 0;
                        transform: translateY(-50%) scaleX(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(-50%) scaleX(1);
                    }
                }
                .inline-search-form {
                    display: flex;
                    align-items: center;
                    background: #F5F5F6;
                    border: 1px solid #E5E5E5;
                    border-radius: 4px;
                    padding: 8px 12px;
                    width: 380px;
                    max-width: calc(100vw - 200px);
                    transition: all 0.2s;
                }
                @media (max-width: 768px) {
                    .inline-search-form {
                        width: 280px;
                        max-width: calc(100vw - 120px);
                    }
                }
                .inline-search-form:focus-within {
                    border-color: #D1D5DB;
                    background: #FFFFFF;
                }
                .inline-search-icon {
                    flex-shrink: 0;
                    margin-right: 10px;
                }
                .inline-search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    color: #1A1A1A;
                    background: transparent;
                    min-width: 0;
                }
                .inline-search-input::placeholder {
                    color: #9CA3AF;
                }
                .inline-search-clear {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: #9CA3AF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                    margin-right: 4px;
                }
                .inline-search-clear:hover {
                    color: #1A1A1A;
                }
                .inline-search-close {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: #6B7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                    margin-left: 4px;
                }
                .inline-search-close:hover {
                    color: #1A1A1A;
                }
                .inline-search-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 380px;
                    max-width: calc(100vw - 200px);
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                    max-height: 70vh;
                    overflow-y: auto;
                    z-index: 1100;
                }
                @media (max-width: 768px) {
                    .inline-search-dropdown {
                        width: 280px;
                        max-width: calc(100vw - 120px);
                    }
                }
                .search-clear {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: #9CA3AF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }
                .search-clear:hover {
                    color: #1A1A1A;
                }

                .search-dropdown {
                    background: white;
                    border-radius: 12px;
                    margin-top: 8px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                    max-height: 70vh;
                    overflow-y: auto;
                }
                .search-section {
                    border-bottom: 1px solid #F3F4F6;
                    padding: 12px 0;
                }
                .search-section:last-child {
                    border-bottom: none;
                }
                .search-section-title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #9CA3AF;
                    padding: 0 16px 8px;
                    margin: 0;
                }
                .search-product-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 16px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    transition: background 0.15s;
                }
                .search-product-item:hover {
                    background: #F9FAFB;
                }
                .search-product-image {
                    position: relative;
                    width: 44px;
                    height: 56px;
                    border-radius: 6px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: #F3F4F6;
                }
                .search-product-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    flex: 1;
                    min-width: 0;
                }
                .search-product-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1A1A1A;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .search-product-meta {
                    font-size: 12px;
                    color: #6B7280;
                }
                .search-suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 16px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    font-size: 14px;
                    color: #1A1A1A;
                    transition: background 0.15s;
                }
                .search-suggestion-item:hover {
                    background: #F9FAFB;
                }
                .search-suggestion-item span:first-of-type {
                    flex: 1;
                    font-weight: 500;
                }
                .search-suggestion-type {
                    font-size: 12px;
                    color: #9CA3AF;
                    font-weight: 400 !important;
                }
                .search-view-all {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px 16px;
                    background: #FFFBF5;
                    border: none;
                    border-top: 1px solid #F3F4F6;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    color: #E85D04;
                    transition: background 0.15s;
                }
                .search-view-all:hover {
                    background: #FFF5EB;
                }
                .search-no-results {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px 20px;
                    text-align: center;
                }
                .search-no-results p {
                    font-size: 14px;
                    color: #1A1A1A;
                    margin: 12px 0 4px;
                }
                .search-no-results span {
                    font-size: 13px;
                    color: #9CA3AF;
                }
                .search-popular {
                    padding: 16px 0;
                }
                .search-popular-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 0 16px;
                }
                .search-popular-tags button {
                    padding: 8px 16px;
                    background: #F3F4F6;
                    border: none;
                    border-radius: 20px;
                    font-size: 13px;
                    color: #4B5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .search-popular-tags button:hover {
                    background: #E85D04;
                    color: white;
                }

                .mobile-menu-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(2px);
                    z-index: 1001;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }
                .mobile-menu-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                /* Mobile Menu Drawer */
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 85%;
                    max-width: 320px;
                    background: #FFFFFF;
                    z-index: 1002;
                    transform: translateX(-100%);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
                }
                .mobile-menu.open {
                    transform: translateX(0);
                }
                @media (min-width: 768px) {
                    .mobile-menu { display: none; }
                    .mobile-menu-overlay { display: none; }
                }

                /* Mobile Menu Header */
                .mobile-menu-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid #E5E5E5;
                }
                .mobile-menu-logo {
                    text-decoration: none;
                    color: #1A1A1A;
                }
                .mobile-menu-logo h2 {
                    font-size: 18px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    margin: 0;
                }
                .mobile-menu-logo p {
                    font-size: 7px;
                    letter-spacing: 2px;
                    color: #6B6B6B;
                    margin: 2px 0 0;
                }
                .mobile-menu-close {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #FAFAFA;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    color: #1A1A1A;
                    transition: background 0.2s, color 0.2s;
                }
                .mobile-menu-close:hover {
                    background: #E85D04;
                    color: white;
                }

                /* Mobile Menu Content */
                .mobile-menu-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0 24px;
                }

                /* Section Styles */
                .mobile-menu-section {
                    padding: 16px 20px;
                }
                .mobile-menu-section-title {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #9CA3AF;
                    margin-bottom: 8px;
                    padding: 0 4px;
                }

                /* Navigation Links */
                .mobile-nav-link {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 16px;
                    text-decoration: none;
                    color: #1A1A1A;
                    font-size: 15px;
                    font-weight: 500;
                    border-radius: 12px;
                    transition: background 0.2s, color 0.2s;
                    margin-bottom: 4px;
                }
                .mobile-nav-link:last-child {
                    margin-bottom: 0;
                }
                .mobile-nav-link:hover,
                .mobile-nav-link.active {
                    background: #FFF5F0;
                    color: #E85D04;
                }

                /* Icon Container */
                .mobile-nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }
                .mobile-nav-icon svg {
                    color: #6B6B6B;
                    transition: color 0.2s;
                }
                .mobile-nav-link:hover .mobile-nav-icon svg,
                .mobile-nav-link.active .mobile-nav-icon svg {
                    color: #E85D04;
                }

                /* Text */
                .mobile-nav-text {
                    flex: 1;
                }

                /* Badge */
                .mobile-badge {
                    padding: 4px 10px;
                    background: #E85D04;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 20px;
                    min-width: 24px;
                    text-align: center;
                }

                /* Mobile Category Accordion */
                .mobile-category-accordion {
                    margin-bottom: 4px;
                }
                .mobile-category-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    width: 100%;
                    padding: 14px 20px;
                    background: transparent;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 500;
                    color: #1A1A1A;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    text-align: left;
                    font-family: inherit;
                }
                .mobile-category-header:hover {
                    background: #F5F5F5;
                }
                .mobile-category-header.expanded {
                    background: #FFF5F0;
                    color: #E85D04;
                }
                .mobile-category-chevron {
                    margin-left: auto;
                    transition: transform 0.3s ease;
                    color: #6B6B6B;
                }
                .mobile-category-header.expanded .mobile-category-chevron {
                    transform: rotate(180deg);
                    color: #E85D04;
                }
                .mobile-category-header .mobile-nav-icon svg {
                    color: #6B6B6B;
                    transition: color 0.2s;
                }
                .mobile-category-header.expanded .mobile-nav-icon svg {
                    color: #E85D04;
                }
                .mobile-category-content {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease, padding 0.3s ease;
                    padding-left: 58px;
                }
                .mobile-category-content.expanded {
                    max-height: 400px;
                    padding-bottom: 8px;
                }
                .mobile-subcategory-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 16px;
                    margin-bottom: 6px;
                    color: #6B6B6B;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.15s;
                }
                .subcategory-bullet {
                    color: #E85D04;
                    font-size: 18px;
                    font-weight: bold;
                    line-height: 1;
                }
                .mobile-subcategory-link:hover {
                    background: #F5F5F5;
                    color: #E85D04;
                    padding-left: 20px;
                }

                /* User Section */
                .mobile-menu-user-section {
                    padding: 16px 20px;
                    margin-top: auto;
                    border-top: 1px solid #E5E5E5;
                }

                /* Profile Card */
                .mobile-profile-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    background: #F9FAFB;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: background 0.2s;
                }
                .mobile-profile-card:hover {
                    background: #F3F4F6;
                }
                .mobile-profile-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #E85D04;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .mobile-profile-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .mobile-profile-avatar span {
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .mobile-profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    flex: 1;
                    min-width: 0;
                }
                .mobile-profile-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #1A1A1A;
                }
                .mobile-profile-email {
                    font-size: 13px;
                    color: #6B6B6B;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .mobile-profile-arrow {
                    color: #9CA3AF;
                    flex-shrink: 0;
                }

                /* Sign In Button */
                .mobile-sign-in-btn {
                    display: block;
                    width: 100%;
                    padding: 16px;
                    background: #1A1A1A;
                    color: white;
                    text-align: center;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    border-radius: 12px;
                    transition: background 0.2s;
                }
                .mobile-sign-in-btn:hover {
                    background: #333;
                }

                /* Search Overlay */
                .search-overlay {
                    position: fixed;
                    inset: 0;
                    background: #FFFFFF;
                    z-index: 2000;
                    transform: translateY(-100%);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 40px 24px;
                }
                .search-overlay.open {
                    transform: translateY(0);
                }
                .search-container {
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                }
                .search-close {
                    position: absolute;
                    top: -10px;
                    right: 0;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--primary);
                    padding: 8px;
                    transition: transform 0.2s;
                }
                .search-close:hover {
                    transform: rotate(90deg);
                    color: #E85D04;
                }
                .search-form {
                    margin-top: 60px;
                }
                .search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    border-bottom: 2px solid #E5E5E5;
                    padding-bottom: 12px;
                    transition: border-color 0.3s;
                }
                .search-input-wrapper:focus-within {
                    border-color: #E85D04;
                }
                .search-input-icon {
                    color: #9CA3AF;
                    margin-right: 16px;
                }
                .search-input-wrapper input {
                    width: 100%;
                    background: none;
                    border: none;
                    font-size: 20px;
                    font-weight: 500;
                    color: var(--primary);
                    outline: none;
                }
                .search-input-wrapper input::placeholder {
                    color: #9CA3AF;
                }
                .search-suggestions {
                    margin-top: 40px;
                }
                .search-suggestions p {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #9CA3AF;
                    margin-bottom: 16px;
                }
                .suggestion-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .suggestion-tags button {
                    padding: 8px 16px;
                    background: #F3F4F6;
                    border: none;
                    border-radius: 20px;
                    font-size: 14px;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .suggestion-tags button:hover {
                    background: #E85D04;
                    color: white;
                }

                @media (min-width: 768px) {
                    .search-overlay {
                        padding: 80px 48px;
                    }
                    .search-input-wrapper input {
                        font-size: 32px;
                    }
                }
            `}</style>

            {/* Global styles for mobile menu links (needed for Next.js Link components) */}
            <style jsx global>{`
                /* Navigation Links */
                .mobile-nav-link {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    gap: 16px !important;
                    padding: 14px 16px !important;
                    text-decoration: none !important;
                    color: #1A1A1A !important;
                    font-size: 15px !important;
                    font-weight: 500 !important;
                    border-radius: 12px !important;
                    transition: background 0.2s, color 0.2s !important;
                    margin-bottom: 4px !important;
                }
                .mobile-nav-link:last-child {
                    margin-bottom: 0 !important;
                }
                .mobile-nav-link:hover,
                .mobile-nav-link.active {
                    background: #FFF5F0 !important;
                    color: #E85D04 !important;
                }

                /* Icon Container */
                .mobile-nav-icon {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 24px !important;
                    height: 24px !important;
                    flex-shrink: 0 !important;
                }
                .mobile-nav-icon svg {
                    color: #6B6B6B !important;
                    transition: color 0.2s !important;
                }
                .mobile-nav-link:hover .mobile-nav-icon svg,
                .mobile-nav-link.active .mobile-nav-icon svg {
                    color: #E85D04 !important;
                }

                /* Text */
                .mobile-nav-text {
                    flex: 1 !important;
                }

                /* Badge */
                .mobile-badge {
                    padding: 4px 10px !important;
                    background: #E85D04 !important;
                    color: white !important;
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    border-radius: 20px !important;
                    min-width: 24px !important;
                    text-align: center !important;
                }

                /* Profile Card */
                .mobile-profile-card {
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    padding: 14px 16px !important;
                    background: #F9FAFB !important;
                    border-radius: 12px !important;
                    text-decoration: none !important;
                    transition: background 0.2s !important;
                }
                .mobile-profile-card:hover {
                    background: #F3F4F6 !important;
                }

                /* Sign In Button */
                .mobile-sign-in-btn {
                    display: block !important;
                    width: 100% !important;
                    padding: 16px !important;
                    background: #1A1A1A !important;
                    color: white !important;
                    text-align: center !important;
                    text-decoration: none !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    letter-spacing: 1px !important;
                    border-radius: 12px !important;
                    transition: background 0.2s !important;
                }
                .mobile-sign-in-btn:hover {
                    background: #333 !important;
                }
            `}</style>
        </>
    );
}
