// Product type definition for the e-commerce application
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
    stock?: { [size: string]: number }; // Stock per size, e.g., { 'S': 10, 'M': 5, 'L': 0 }
}

// Wishlist item extends Product with additional metadata
export interface WishlistItem extends Product {
    addedAt: number; // Timestamp when added to wishlist
}

// Cart item extends Product with quantity
export interface CartItem extends Product {
    quantity: number;
}

// User data stored in Firestore
export interface UserData {
    uid: string;
    email: string | null;
    displayName: string;
    phoneNumber: string;
    photoURL?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
    images?: string[];
    verified: boolean;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any; // Firestore Timestamp
    likes: number;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    expiryDate: any; // Firestore Timestamp
    isActive: boolean;
    usageLimit: number;
    usageCount: number;
}
