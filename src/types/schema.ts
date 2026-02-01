import { Timestamp } from 'firebase/firestore';

/**
 * USER MODEL
 * Collection: /users/{uid}
 */
export interface UserProfile {
    uid: string;
    email: string | null;
    name: string;
    photoUrl: string;
    provider: string; // e.g., 'email', 'google'
    phoneNumber?: string;
    createdAt: Timestamp | any;
    lastLogin: Timestamp | any;
}

/**
 * PRODUCT MODEL
 * Collection: /products/{productId}
 */
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Stored as number for calculations
    originalPrice?: number;
    currency: string; // e.g., 'INR'
    category: string;
    subcategory: string;
    images: string[]; // Array of image URLs
    thumbnail: string;
    tag?: string; // e.g., 'New Arrival', 'Sale'
    stock: {
        [size: string]: number; // e.g., { 'S': 10, 'M': 5 }
    };
    attributes: {
        color?: string;
        material?: string;
        [key: string]: any;
    };
    rating: number;
    reviewCount: number;
    isActive: boolean;
    createdAt: Timestamp | any;
    updatedAt: Timestamp | any;
}

/**
 * ORDER MODEL
 * Collection: /orders/{orderId}
 */
export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size: string;
}

export interface Address {
    fullName: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    type?: 'home' | 'work' | 'other';
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'upi' | 'cod' | 'card';
    paymentDetails?: {
        upiId?: string;
        transactionId?: string;
    };
    shippingAddress: Address;
    billingAddress?: Address;
    createdAt: Timestamp | any;
    updatedAt: Timestamp | any;
    estimatedDelivery?: Timestamp | any;
}

/**
 * REVIEW MODEL
 * Collection: /reviews/{reviewId}
 */
export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
    images?: string[];
    verified: boolean;
    status: 'pending' | 'approved' | 'rejected'; // Added for moderation
    createdAt: Timestamp | any;
    likes: number;
}

/**
 * COUPON MODEL
 * Collection: /coupons/{couponId}
 */
export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    expiryDate: Timestamp | any;
    isActive: boolean;
    usageLimit: number;
    usageCount: number;
}

/**
 * CART/WISHLIST SYNC (Optional for DB sync)
 * Collection: /users/{uid}/cart or /users/{uid}/wishlist
 */
export interface WishlistItem {
    productId: string;
    addedAt: Timestamp | any;
}

export interface CartItem {
    productId: string;
    quantity: number;
    size: string;
    addedAt: Timestamp | any;
}
