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
// Fallback to static data if Firestore is unavailable
import { products as staticProducts, getProductById as getStaticProductById } from '@/data/products';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: string | null;
    getProductById: (id: string) => Product | undefined;
    getSimilarProducts: (product: Product, limit?: number) => Product[];
    searchProducts: (query: string) => Product[];
    getProductsByCategory: (category: string) => Product[];
    getProductsBySubcategory: (subcategory: string) => Product[];
    getDiscountPercent: (product: Product) => string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingFallback, setUsingFallback] = useState(false);

    // Subscribe to Firestore products with fallback to static data
    useEffect(() => {
        setLoading(true);

        // Timeout to fallback to static data if Firestore takes too long
        const fallbackTimeout = setTimeout(() => {
            if (products.length === 0 && loading) {
                console.log('[ProductContext] Falling back to static data');
                setProducts(staticProducts as Product[]);
                setUsingFallback(true);
                setLoading(false);
            }
        }, 5000); // 5 second timeout

        const unsubscribe = ProductService.subscribeToProducts((firestoreProducts) => {
            clearTimeout(fallbackTimeout);

            if (firestoreProducts.length > 0) {
                setProducts(firestoreProducts);
                setUsingFallback(false);
            } else if (!usingFallback) {
                // Firestore returned empty, use static data
                console.log('[ProductContext] Firestore empty, using static data');
                setProducts(staticProducts as Product[]);
                setUsingFallback(true);
            }
            setLoading(false);
            setError(null);
        });

        return () => {
            clearTimeout(fallbackTimeout);
            unsubscribe();
        };
    }, []);

    const getProductById = useCallback(
        (id: string): Product | undefined => {
            // First try from current products
            const product = products.find(p => p.id === id);
            if (product) return product;

            // Fallback to static data
            const staticProduct = getStaticProductById(id);
            return staticProduct as Product | undefined;
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
