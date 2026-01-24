// Zcloths Products Data Module
// Centralized product data with TypeScript interfaces and helper functions

export interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice: string;
    tag: string;
    category: string;
    subcategory: string;
    image: string;
    images: string[];
    rating: number;
    reviewCount: number;
    description: string;
    sizes: string[];
}

// Category Structure
export interface SubCategory {
    name: string;
    slug: string;
}

export interface Category {
    name: string;
    slug: string;
    subcategories: SubCategory[];
}

export const categories: Category[] = [
    {
        name: 'Tops',
        slug: 'tops',
        subcategories: [
            { name: 'Plain Shirt', slug: 'plain-shirt' },
            { name: 'Printed Shirt', slug: 'printed-shirt' },
        ],
    },
    {
        name: 'Bottoms',
        slug: 'bottoms',
        subcategories: [
            { name: 'Formal Pant', slug: 'formal-pant' },
            { name: 'Baggy Pant', slug: 'baggy-pant' },
            { name: 'Chinos', slug: 'chinos' },
            { name: 'Cargos', slug: 'cargos' },
        ],
    },
    {
        name: 'Jackets',
        slug: 'jackets',
        subcategories: [
            { name: 'Winter Jacket', slug: 'winter-jacket' },
            { name: 'Bomber Jacket', slug: 'bomber-jacket' },
            { name: 'Denim Jacket', slug: 'denim-jacket' },
        ],
    },
];

// Products data - shared across shop and product details pages
export const products: Product[] = [
    // ===== TOPS - Plain Shirts =====
    {
        id: 'plain-shirt-1',
        name: 'Classic White Shirt',
        price: '₹1,599',
        originalPrice: '',
        tag: 'Bestseller',
        category: 'Tops',
        subcategory: 'Plain Shirt',
        image: '/images/products/Shirt-1.jpg',
        images: ['/images/products/Shirt-1.jpg'],
        rating: 4.9,
        reviewCount: 234,
        description: 'A timeless classic white shirt crafted from premium cotton. Perfect for office wear, formal events, or casual outings. Features a regular fit with a spread collar and easy-to-maintain fabric.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'plain-shirt-2',
        name: 'Navy Cotton Shirt',
        price: '₹1,499',
        originalPrice: '₹1,899',
        tag: 'Sale',
        category: 'Tops',
        subcategory: 'Plain Shirt',
        image: '/images/products/Shirt-2.jpg',
        images: ['/images/products/Shirt-2.jpg'],
        rating: 4.6,
        reviewCount: 167,
        description: 'Elegant navy blue cotton shirt with a modern slim fit. Breathable fabric ensures comfort throughout the day. Ideal for both professional and casual settings.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    {
        id: 'plain-shirt-3',
        name: 'Sky Blue Linen Shirt',
        price: '₹1,799',
        originalPrice: '',
        tag: '',
        category: 'Tops',
        subcategory: 'Plain Shirt',
        image: '/images/products/Shirt-1.jpg',
        images: ['/images/products/Shirt-1.jpg'],
        rating: 4.5,
        reviewCount: 145,
        description: 'Experience breathable luxury with this sky blue linen shirt. Made from 100% natural linen, perfect for warm weather. Relaxed fit with lightweight fabric.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    // ===== TOPS - Printed Shirts =====
    {
        id: 'printed-shirt-1',
        name: 'Floral Print Shirt',
        price: '₹1,699',
        originalPrice: '',
        tag: 'New',
        category: 'Tops',
        subcategory: 'Printed Shirt',
        image: '/images/products/Shirt-2.jpg',
        images: ['/images/products/Shirt-2.jpg'],
        rating: 4.4,
        reviewCount: 89,
        description: 'Stand out with this stylish floral print shirt. Perfect for vacations, parties, and casual outings. Made from soft cotton with vibrant, fade-resistant prints.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'printed-shirt-2',
        name: 'Geometric Pattern Shirt',
        price: '₹1,599',
        originalPrice: '₹1,999',
        tag: 'Trending',
        category: 'Tops',
        subcategory: 'Printed Shirt',
        image: '/images/products/Shirt-1.jpg',
        images: ['/images/products/Shirt-1.jpg'],
        rating: 4.3,
        reviewCount: 112,
        description: 'Modern geometric pattern shirt for the fashion-forward man. Unique abstract design with comfortable fit. Great for casual Fridays and weekend outings.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    // ===== BOTTOMS - Formal Pants =====
    {
        id: 'formal-pant-1',
        name: 'Classic Black Formal Pant',
        price: '₹1,999',
        originalPrice: '',
        tag: 'Bestseller',
        category: 'Bottoms',
        subcategory: 'Formal Pant',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.8,
        reviewCount: 312,
        description: 'Premium black formal trousers with a tailored fit. Features a flat front design with side pockets. Perfect for office wear and formal occasions. Wrinkle-resistant fabric.',
        sizes: ['28', '30', '32', '34', '36', '38'],
    },
    {
        id: 'formal-pant-2',
        name: 'Charcoal Grey Trouser',
        price: '₹2,199',
        originalPrice: '₹2,699',
        tag: 'Sale',
        category: 'Bottoms',
        subcategory: 'Formal Pant',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.7,
        reviewCount: 198,
        description: 'Sophisticated charcoal grey trousers crafted from premium wool blend. Classic pleated design with a comfortable fit. Ideal for boardroom meetings and formal events.',
        sizes: ['30', '32', '34', '36', '38'],
    },
    // ===== BOTTOMS - Baggy Pants =====
    {
        id: 'baggy-pant-1',
        name: 'Relaxed Fit Baggy Pants',
        price: '₹1,799',
        originalPrice: '',
        tag: 'Trending',
        category: 'Bottoms',
        subcategory: 'Baggy Pant',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.5,
        reviewCount: 156,
        description: 'Ultra-comfortable baggy pants with a relaxed fit. Made from soft cotton twill. Features a drawstring waist and deep pockets. Perfect for streetwear and casual looks.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'baggy-pant-2',
        name: 'Wide Leg Joggers',
        price: '₹1,599',
        originalPrice: '',
        tag: 'New',
        category: 'Bottoms',
        subcategory: 'Baggy Pant',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.4,
        reviewCount: 123,
        description: 'Modern wide leg joggers combining comfort with style. Elastic waistband with adjustable drawstring. Great for lounging, workouts, or casual outings.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    // ===== BOTTOMS - Chinos =====
    {
        id: 'chinos-1',
        name: 'Khaki Slim Chinos',
        price: '₹1,899',
        originalPrice: '₹2,299',
        tag: 'Sale',
        category: 'Bottoms',
        subcategory: 'Chinos',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.7,
        reviewCount: 245,
        description: 'Classic khaki chinos with a modern slim fit. Made from stretch cotton for all-day comfort. Versatile enough for office or weekend wear.',
        sizes: ['28', '30', '32', '34', '36'],
    },
    {
        id: 'chinos-2',
        name: 'Navy Blue Chinos',
        price: '₹1,799',
        originalPrice: '',
        tag: '',
        category: 'Bottoms',
        subcategory: 'Chinos',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.6,
        reviewCount: 189,
        description: 'Elegant navy blue chinos perfect for smart-casual occasions. Features a comfortable tapered fit with stretch fabric. Easy to pair with shirts or t-shirts.',
        sizes: ['28', '30', '32', '34', '36', '38'],
    },
    // ===== BOTTOMS - Cargos =====
    {
        id: 'cargo-1',
        name: 'Tactical Cargo Pants',
        price: '₹2,299',
        originalPrice: '',
        tag: 'Premium',
        category: 'Bottoms',
        subcategory: 'Cargos',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.8,
        reviewCount: 178,
        description: 'Heavy-duty tactical cargo pants with multiple utility pockets. Made from durable ripstop fabric. Perfect for outdoor adventures and everyday wear.',
        sizes: ['30', '32', '34', '36', '38'],
    },
    {
        id: 'cargo-2',
        name: 'Olive Green Cargos',
        price: '₹1,999',
        originalPrice: '₹2,499',
        tag: 'Trending',
        category: 'Bottoms',
        subcategory: 'Cargos',
        image: '/images/products/Kurta.jpg',
        images: ['/images/products/Kurta.jpg'],
        rating: 4.5,
        reviewCount: 134,
        description: 'Classic olive green cargo pants with a relaxed fit. Features six functional pockets and adjustable ankle cuffs. Great for casual and outdoor activities.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    // ===== JACKETS - Winter Jackets =====
    {
        id: 'winter-jacket-1',
        name: 'Premium Puffer Jacket',
        price: '₹4,999',
        originalPrice: '₹5,999',
        tag: 'Sale',
        category: 'Jackets',
        subcategory: 'Winter Jacket',
        image: '/images/products/Hoddie-1.jpg',
        images: ['/images/products/Hoddie-1.jpg'],
        rating: 4.9,
        reviewCount: 267,
        description: 'Stay warm in style with our premium puffer jacket. Features synthetic down insulation and water-resistant outer shell. Hood with faux fur trim. Perfect for harsh winters.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'winter-jacket-2',
        name: 'Wool Blend Overcoat',
        price: '₹6,499',
        originalPrice: '',
        tag: 'Premium',
        category: 'Jackets',
        subcategory: 'Winter Jacket',
        image: '/images/products/Hoddie-2.jpg',
        images: ['/images/products/Hoddie-2.jpg'],
        rating: 4.8,
        reviewCount: 145,
        description: 'Elegant wool blend overcoat for a sophisticated winter look. Classic single-breasted design with notched lapels. Fully lined with inner pockets.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    // ===== JACKETS - Bomber Jackets =====
    {
        id: 'bomber-jacket-1',
        name: 'Classic Black Bomber',
        price: '₹3,499',
        originalPrice: '',
        tag: 'Bestseller',
        category: 'Jackets',
        subcategory: 'Bomber Jacket',
        image: '/images/products/Hoddie-1.jpg',
        images: ['/images/products/Hoddie-1.jpg'],
        rating: 4.7,
        reviewCount: 234,
        description: 'Iconic black bomber jacket with a modern fit. Features ribbed cuffs, collar, and hem. Perfect for layering over casual outfits. Zip-up front with side pockets.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'bomber-jacket-2',
        name: 'Army Green Bomber',
        price: '₹3,299',
        originalPrice: '₹3,999',
        tag: 'Trending',
        category: 'Jackets',
        subcategory: 'Bomber Jacket',
        image: '/images/products/Hoddie-2.jpg',
        images: ['/images/products/Hoddie-2.jpg'],
        rating: 4.6,
        reviewCount: 189,
        description: 'Military-inspired army green bomber jacket. Features a lightweight yet warm design. Multiple pockets including arm pocket. Great for spring and fall.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
    // ===== JACKETS - Denim Jackets =====
    {
        id: 'denim-jacket-1',
        name: 'Classic Blue Denim Jacket',
        price: '₹2,999',
        originalPrice: '',
        tag: 'New',
        category: 'Jackets',
        subcategory: 'Denim Jacket',
        image: '/images/products/Hoddie-1.jpg',
        images: ['/images/products/Hoddie-1.jpg'],
        rating: 4.8,
        reviewCount: 312,
        description: 'Timeless blue denim jacket with a vintage wash. Features classic button-up front with chest pockets. An essential piece for any wardrobe.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'denim-jacket-2',
        name: 'Black Denim Jacket',
        price: '₹3,199',
        originalPrice: '₹3,799',
        tag: 'Sale',
        category: 'Jackets',
        subcategory: 'Denim Jacket',
        image: '/images/products/Hoddie-2.jpg',
        images: ['/images/products/Hoddie-2.jpg'],
        rating: 4.5,
        reviewCount: 178,
        description: 'Sleek black denim jacket with a modern edge. Same classic design with a contemporary dark wash. Perfect for evening outings and concerts.',
        sizes: ['S', 'M', 'L', 'XL'],
    },
];

// Helper function to get a product by ID
export function getProductById(id: string): Product | undefined {
    return products.find(product => product.id === id);
}

// Helper function to get similar products (same subcategory, excluding current product)
export function getSimilarProducts(product: Product, limit: number = 6): Product[] {
    // First try same subcategory
    let similar = products.filter(p => p.subcategory === product.subcategory && p.id !== product.id);
    // If not enough, add same category
    if (similar.length < limit) {
        const sameCategory = products.filter(p => p.category === product.category && p.id !== product.id && !similar.includes(p));
        similar = [...similar, ...sameCategory];
    }
    return similar.slice(0, limit);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
    return products.filter(p => p.category === category);
}

// Helper function to get products by subcategory
export function getProductsBySubcategory(subcategory: string): Product[] {
    return products.filter(p => p.subcategory === subcategory);
}

// Helper function to extract numeric price for calculations
export function getNumericPrice(priceStr: string): number {
    return parseInt(priceStr.replace(/[₹,]/g, ''));
}

// Calculate discount percentage
export function getDiscountPercent(product: Product): string {
    if (!product.originalPrice) return '';
    const current = getNumericPrice(product.price);
    const original = getNumericPrice(product.originalPrice);
    const discount = Math.round(((original - current) / original) * 100);
    return `${discount}% OFF`;
}
