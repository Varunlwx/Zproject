// Product type definition for the e-commerce application
export interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    tag?: string;
    category?: string;
    image: string;
    rating?: number;
    size?: string;
    color?: string;
}

// Wishlist item extends Product with additional metadata
export interface WishlistItem extends Product {
    addedAt: number; // Timestamp when added to wishlist
}

// Cart item extends Product with quantity
export interface CartItem extends Product {
    quantity: number;
}
