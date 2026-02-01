import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
    Unsubscribe,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Product interface matching the existing structure
export interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    tag?: string;
    category: string;
    subcategory: string;
    image: string;
    images: string[];
    rating: number;
    reviewCount: number;
    description: string;
    sizes: string[];
    stock?: { [size: string]: number }; // Stock per size
}

// Collection reference
const PRODUCTS_COLLECTION = 'products';

function asString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
    if (Array.isArray(value)) {
        const strings = value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
        return strings.length > 0 ? strings : fallback;
    }
    return fallback;
}

function asNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeProduct(id: string, data: DocumentData): Product {
    // NOTE: We must always provide safe defaults because UI code assumes these exist
    // and calls string methods like `.toLowerCase()` / `.replace()`.
    const image = asString(data?.image, '/images/products/Shirt-1.jpg');
    const images = asStringArray(data?.images, [image]);

    return {
        id,
        name: asString(data?.name, 'Untitled Product'),
        price: asString(data?.price, '0'),
        originalPrice: typeof data?.originalPrice === 'string' ? data.originalPrice : undefined,
        tag: typeof data?.tag === 'string' ? data.tag : undefined,
        category: asString(data?.category, 'Uncategorized'),
        subcategory: asString(data?.subcategory, ''),
        image,
        images,
        rating: asNumber(data?.rating, 0),
        reviewCount: asNumber(data?.reviewCount, 0),
        description: asString(data?.description, ''),
        sizes: asStringArray(data?.sizes, []),
        stock: data?.stock,
    };
}

export const ProductService = {
    /**
     * Subscribe to products with optional filtering (real-time updates)
     */
    subscribeToProducts: (
        callback: (products: Product[]) => void,
        filters?: { category?: string; subcategory?: string }
    ): Unsubscribe => {
        let q = query(collection(db, PRODUCTS_COLLECTION));

        if (filters?.category && filters.category !== 'All') {
            q = query(q, where('category', '==', filters.category));
        }

        if (filters?.subcategory) {
            q = query(q, where('subcategory', '==', filters.subcategory));
        }

        q = query(q, orderBy('name'));

        return onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const products = snapshot.docs.map((docSnap) => normalizeProduct(docSnap.id, docSnap.data()));
                callback(products);
            },
            (error) => {
                console.error('[ProductService] Error subscribing to products:', error);
                callback([]);
            }
        );
    },

    /**
     * Get all products (one-time fetch)
     */
    getAllProducts: async (): Promise<Product[]> => {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                orderBy('name')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((docSnap) => normalizeProduct(docSnap.id, docSnap.data()));
        } catch (error) {
            console.error('[ProductService] Error fetching all products:', error);
            return [];
        }
    },

    /**
     * Get a single product by ID
     */
    getProductById: async (id: string): Promise<Product | null> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return normalizeProduct(docSnap.id, docSnap.data());
            }
            return null;
        } catch (error) {
            console.error('[ProductService] Error fetching product by ID:', error);
            return null;
        }
    },

    /**
     * Get products by category
     */
    getProductsByCategory: async (category: string): Promise<Product[]> => {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('category', '==', category)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((docSnap) => normalizeProduct(docSnap.id, docSnap.data()));
        } catch (error) {
            console.error('[ProductService] Error fetching products by category:', error);
            return [];
        }
    },

    /**
     * Get products by subcategory
     */
    getProductsBySubcategory: async (subcategory: string): Promise<Product[]> => {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('subcategory', '==', subcategory)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((docSnap) => normalizeProduct(docSnap.id, docSnap.data()));
        } catch (error) {
            console.error('[ProductService] Error fetching products by subcategory:', error);
            return [];
        }
    },

    /**
     * Get similar products (same subcategory or category)
     */
    getSimilarProducts: (
        allProducts: Product[],
        currentProduct: Product,
        limit: number = 6
    ): Product[] => {
        // First try same subcategory
        let similar = allProducts.filter(
            p => p.subcategory === currentProduct.subcategory && p.id !== currentProduct.id
        );

        // If not enough, add same category
        if (similar.length < limit) {
            const sameCategory = allProducts.filter(
                p => p.category === currentProduct.category &&
                    p.id !== currentProduct.id &&
                    !similar.includes(p)
            );
            similar = [...similar, ...sameCategory];
        }

        return similar.slice(0, limit);
    },

    /**
     * Search products by query (client-side filtering)
     * Note: For production, consider Algolia or Firestore full-text search extension
     */
    searchProducts: (
        allProducts: Product[],
        searchQuery: string
    ): Product[] => {
        if (!searchQuery.trim()) return allProducts;

        const query = searchQuery.toLowerCase();
        return allProducts.filter(p =>
            (p.name ?? '').toLowerCase().includes(query) ||
            (p.category ?? '').toLowerCase().includes(query) ||
            (p.subcategory ?? '').toLowerCase().includes(query) ||
            (p.tag && p.tag.toLowerCase().includes(query))
        );
    },

    /**
     * Get discount percentage for a product
     */
    getDiscountPercent: (product: Product): string => {
        if (!product.originalPrice) return '';
        const current = parseInt((product.price ?? '0').replace(/[₹,]/g, ''));
        const original = parseInt(product.originalPrice.replace(/[₹,]/g, ''));
        if (isNaN(current) || isNaN(original) || original === 0) return '';
        const discount = Math.round(((original - current) / original) * 100);
        return `${discount}% OFF`;
    },

    /**
     * Get numeric price for calculations
     */
    getNumericPrice: (priceStr: string): number => {
        return parseInt(priceStr.replace(/[₹,]/g, '')) || 0;
    },

    // ==================== ADMIN CRUD OPERATIONS ====================

    /**
     * Add a new product
     */
    addProduct: async (product: Omit<Product, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
                ...product,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('[ProductService] Error adding product:', error);
            throw error;
        }
    },

    /**
     * Update an existing product
     */
    updateProduct: async (id: string, updates: Partial<Product>): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('[ProductService] Error updating product:', error);
            throw error;
        }
    },

    /**
     * Delete a product
     */
    deleteProduct: async (id: string): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('[ProductService] Error deleting product:', error);
            throw error;
        }
    }
};
