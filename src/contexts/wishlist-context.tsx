'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, WishlistItem } from '@/types';
import { useToast } from './toast-context';

// Constants
const WISHLIST_STORAGE_KEY = 'zcloths_wishlist';

// Context type definition
interface WishlistContextType {
    wishlistItems: WishlistItem[];
    wishlistCount: number;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

// Create context with undefined default
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider component
export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const { showToast } = useToast();

    // Load wishlist from localStorage on mount (client-side only)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setWishlistItems(parsed);
                }
            }
        } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
        }
        setIsHydrated(true);
    }, []);

    // Save wishlist to localStorage whenever it changes (after hydration)
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
            } catch (error) {
                console.error('Error saving wishlist to localStorage:', error);
            }
        }
    }, [wishlistItems, isHydrated]);

    // Add product to wishlist
    const addToWishlist = useCallback((product: Product) => {
        const alreadyExists = wishlistItems.some(item => item.id === product.id);
        if (alreadyExists) return;

        const wishlistItem: WishlistItem = {
            ...product,
            addedAt: Date.now(),
        };

        setWishlistItems(prev => [...prev, wishlistItem]);
        showToast(`${product.name} added to wishlist`, 'success', 'heart');
    }, [wishlistItems, showToast]);

    // Remove product from wishlist
    const removeFromWishlist = useCallback((productId: string) => {
        const item = wishlistItems.find(i => i.id === productId);
        if (item) {
            setWishlistItems(prev => prev.filter(item => item.id !== productId));
            showToast(`${item.name} removed from wishlist`, 'success', 'heart');
        }
    }, [wishlistItems, showToast]);

    // Toggle product in wishlist
    const toggleWishlist = useCallback((product: Product) => {
        const exists = wishlistItems.some(item => item.id === product.id);

        if (exists) {
            setWishlistItems(prev => prev.filter(item => item.id !== product.id));
            showToast(`${product.name} removed from wishlist`, 'success', 'heart');
        } else {
            const wishlistItem: WishlistItem = {
                ...product,
                addedAt: Date.now(),
            };
            setWishlistItems(prev => [...prev, wishlistItem]);
            showToast(`${product.name} added to wishlist`, 'success', 'heart');
        }
    }, [wishlistItems, showToast]);

    // Check if product is in wishlist
    const isInWishlist = useCallback((productId: string) => {
        return wishlistItems.some(item => item.id === productId);
    }, [wishlistItems]);

    // Clear entire wishlist
    const clearWishlist = useCallback(() => {
        setWishlistItems([]);
        showToast('Wishlist cleared', 'success', 'heart');
    }, [showToast]);

    // Compute wishlist count
    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

// Custom hook for consuming wishlist context
export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
