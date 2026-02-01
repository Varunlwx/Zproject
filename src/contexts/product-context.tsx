'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import { ProductService, Product } from '@/services/product-service';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: string | null;
    getProductById: (id: string) => Promise<Product | undefined>;
    getSimilarProducts: (product: Product, limit?: number) => Product[];
    searchProducts: (query: string) => Product[];
    getProductsByCategory: (category: string) => Product[];
    getProductsBySubcategory: (subcategory: string) => Product[];
    getDiscountPercent: (product: Product) => string;
    setFilters: (filters: { category?: string; subcategory?: string }) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<{ category?: string; subcategory?: string }>({});

    // Real-time subscription to Firebase
    useEffect(() => {
        setLoading(true);
        console.log('[ProductContext] Connecting to Firebase with filters:', activeFilters);

        const unsubscribe = ProductService.subscribeToProducts(
            (fetchedProducts) => {
                setProducts(fetchedProducts);
                setLoading(false);
                setError(null);
            },
            activeFilters
        );

        return () => {
            console.log('[ProductContext] Unsubscribing from Firebase');
            unsubscribe();
        };
    }, [activeFilters]);

    const getProductById = useCallback(
        async (id: string): Promise<Product | undefined> => {
            // First check local products (fastest)
            const local = products.find(p => p.id === id);
            if (local) return local;

            // If not found (e.g., due to filtering), fetch directly from Firebase
            console.log(`[ProductContext] Product ${id} not in local state, fetching from Firebase...`);
            const remote = await ProductService.getProductById(id);
            return remote || undefined;
        },
        [products]
    );

    const getSimilarProducts = useCallback(
        (product: Product, limit: number = 6): Product[] => {
            return ProductService.getSimilarProducts(products, product, limit);
        },
        [products]
    );

    const searchProducts = useCallback(
        (query: string): Product[] => {
            return ProductService.searchProducts(products, query);
        },
        [products]
    );

    const getProductsByCategory = useCallback(
        (category: string): Product[] => {
            if (category === 'All') return products;
            return products.filter(p => p.category === category);
        },
        [products]
    );

    const getProductsBySubcategory = useCallback(
        (subcategory: string): Product[] => {
            return products.filter(p => p.subcategory === subcategory);
        },
        [products]
    );

    const setFilters = useCallback((filters: { category?: string; subcategory?: string }) => {
        setActiveFilters(filters);
    }, []);

    const getDiscountPercent = useCallback(
        (product: Product): string => {
            return ProductService.getDiscountPercent(product);
        },
        []
    );

    return (
        <ProductContext.Provider
            value={{
                products,
                loading,
                error,
                getProductById,
                getSimilarProducts,
                searchProducts,
                getProductsByCategory,
                getProductsBySubcategory,
                getDiscountPercent,
                setFilters,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}

// Re-export Product type for convenience
export type { Product };
