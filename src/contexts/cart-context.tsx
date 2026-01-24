'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Product, CartItem } from '@/types';
import { useToast } from './toast-context';
import { useAuth } from './auth-context';
import { UserService } from '@/services/user-service';

// LocalStorage key
const CART_STORAGE_KEY = 'zcloths_cart';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getCartItem: (productId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper: merge two carts (combine quantities for same items)
function mergeCarts(localCart: CartItem[], firestoreCart: CartItem[]): CartItem[] {
  const merged = [...firestoreCart];

  for (const localItem of localCart) {
    const existingIndex = merged.findIndex(item => item.id === localItem.id);
    if (existingIndex >= 0) {
      // Combine quantities
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + localItem.quantity,
      };
    } else {
      merged.push(localItem);
    }
  }

  return merged;
}

// Helper: get cart from localStorage
function getLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error('[CartContext] Error loading from localStorage:', error);
  }
  return [];
}

// Helper: save cart to localStorage
function saveLocalCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[CartContext] Error saving to localStorage:', error);
  }
}

// Helper: clear localStorage cart
function clearLocalCart() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('[CartContext] Error clearing localStorage:', error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const prevUserRef = useRef<string | null>(null);
  const isSubscribedRef = useRef(false);

  // Handle auth state changes and Firestore subscription
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    const currentUid = user?.uid || null;
    const prevUid = prevUserRef.current;

    // User just logged in
    if (currentUid && !prevUid) {
      const localCart = getLocalCart();

      // Subscribe to Firestore cart
      const unsubscribe = UserService.subscribeToCart(currentUid, async (firestoreItems) => {
        if (!isSubscribedRef.current) {
          // First callback - handle merge
          isSubscribedRef.current = true;

          if (localCart.length > 0) {
            // Merge local cart with Firestore cart
            const mergedCart = mergeCarts(localCart, firestoreItems);
            setCartItems(mergedCart);

            // Save merged cart to Firestore
            await UserService.setCart(currentUid, mergedCart);

            // Clear localStorage after successful merge
            clearLocalCart();
          } else {
            setCartItems(firestoreItems);
          }
        } else {
          // Subsequent callbacks - just update state
          setCartItems(firestoreItems);
        }
      });

      prevUserRef.current = currentUid;
      return () => {
        unsubscribe();
        isSubscribedRef.current = false;
      };
    }

    // User just logged out
    if (!currentUid && prevUid) {
      prevUserRef.current = null;
      isSubscribedRef.current = false;
      setCartItems([]);
      setIsHydrated(true);
      return;
    }

    // User is still logged in (page refresh)
    if (currentUid && prevUid === currentUid) {
      // Already subscribed, no action needed
      return;
    }

    // No user (guest mode) - load from localStorage
    if (!currentUid) {
      const localCart = getLocalCart();
      setCartItems(localCart);
      setIsHydrated(true);
      prevUserRef.current = null;
    }
  }, [user, authLoading]);

  // Persist cart for guest users (localStorage)
  useEffect(() => {
    if (!isHydrated) return;
    if (user) return; // Don't save to localStorage for authenticated users

    saveLocalCart(cartItems);
  }, [cartItems, isHydrated, user]);

  // Sync cart to Firestore for authenticated users
  const syncToFirestore = useCallback(
    async (items: CartItem[]) => {
      if (!user) return;
      try {
        await UserService.setCart(user.uid, items);
      } catch (error) {
        console.error('[CartContext] Error syncing to Firestore:', error);
      }
    },
    [user]
  );

  const addToCart = useCallback(
    (product: Product) => {
      const isExisting = cartItems.some(item => item.id === product.id);

      const newItems = (() => {
        const existing = cartItems.find(item => item.id === product.id);
        if (existing) {
          return cartItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        const newItem: CartItem = { ...product, quantity: 1 };
        return [...cartItems, newItem];
      })();

      setCartItems(newItems);

      // Sync to Firestore for authenticated users
      if (user) {
        syncToFirestore(newItems);
      }

      if (isExisting) {
        showToast(`${product.name} quantity updated in cart`, 'success', 'cart');
      } else {
        showToast(`${product.name} added to cart`, 'success', 'cart');
      }
    },
    [showToast, cartItems, user, syncToFirestore],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const item = cartItems.find(i => i.id === productId);
      const newItems = cartItems.filter(item => item.id !== productId);

      setCartItems(newItems);

      // Sync to Firestore for authenticated users
      if (user) {
        syncToFirestore(newItems);
      }

      if (item) {
        showToast(`${item.name} removed from cart`, 'success', 'cart');
      }
    },
    [showToast, cartItems, user, syncToFirestore],
  );

  const incrementQuantity = useCallback(
    (productId: string) => {
      const newItems = cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      setCartItems(newItems);

      // Sync to Firestore for authenticated users
      if (user) {
        syncToFirestore(newItems);
      }
    },
    [cartItems, user, syncToFirestore],
  );

  const decrementQuantity = useCallback(
    (productId: string) => {
      const newItems = cartItems
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter(item => item.quantity > 0);

      setCartItems(newItems);

      // Sync to Firestore for authenticated users
      if (user) {
        syncToFirestore(newItems);
      }
    },
    [cartItems, user, syncToFirestore],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);

    // Clear from Firestore for authenticated users
    if (user) {
      UserService.clearCart(user.uid).catch(error => {
        console.error('[CartContext] Error clearing Firestore cart:', error);
      });
    }

    showToast('Cart cleared', 'success', 'cart');
  }, [showToast, user]);

  const getCartItem = useCallback(
    (productId: string) => cartItems.find(item => item.id === productId),
    [cartItems],
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );

  const cartTotal = cartItems.reduce((total, item) => {
    const numericPrice = parseInt(
      String(item.price).replace(/[^\d]/g, ''),
      10,
    );
    const price = Number.isNaN(numericPrice) ? 0 : numericPrice;
    return total + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
