'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
import { UserService } from '@/services/user-service';

// Order status types
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'exchange' | 'cancelled';

// Order item structure (matches CartItem)
export interface OrderItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
    image: string;
    review?: Review;
}

export interface Review {
    rating: number;
    comment: string;
    images: string[];
    createdAt: string;
}

// Order structure
export interface Order {
    id: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    address: {
        fullName: string;
        phone: string;
        email: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    paymentMethod: 'online' | 'cod';
    paymentId?: string;  // Razorpay payment ID
    razorpayOrderId?: string;  // Razorpay order ID
    // Shiprocket shipment fields
    shipmentId?: string;  // Shiprocket shipment ID
    awbCode?: string;  // Airway Bill code for tracking
    courierName?: string;  // Courier company name
    status: OrderStatus;
    statusMessage: string;
    createdAt: string;
}

interface OrderContextType {
    orders: Order[];
    loading: boolean;
    addOrder: (order: Omit<Order, 'id' | 'status' | 'statusMessage' | 'createdAt'>) => Promise<Order>;
    getOrderById: (id: string) => Order | undefined;
    updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
    addReview: (orderId: string, itemId: string, review: Omit<Review, 'createdAt'>, userName?: string) => Promise<void>;
    clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Get status message based on order status
const getStatusMessage = (status: OrderStatus): string => {
    switch (status) {
        case 'processing':
            return 'Your order is being processed. We will notify you once it ships.';
        case 'shipped':
            return 'Your order has been shipped and is on its way!';
        case 'delivered':
            return 'Your order has been delivered. Thank you for shopping with us!';
        case 'exchange':
            return 'Order not delivered yet. Exchange order cancellation is not available.';
        case 'cancelled':
            return 'This order has been cancelled.';
        default:
            return '';
    }
};

export function OrderProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to Firestore orders instead of localStorage
    useEffect(() => {
        if (!user) {
            setOrders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = UserService.subscribeToOrders(user.uid, (newOrders) => {
            setOrders(newOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'statusMessage' | 'createdAt'>): Promise<Order> => {
        if (!user) throw new Error('User not authenticated');

        const newOrderData = {
            ...orderData,
            status: 'processing' as OrderStatus,
            statusMessage: getStatusMessage('processing'),
        };

        const docRef = await UserService.addOrder(user.uid, newOrderData);

        return {
            id: docRef.id,
            ...newOrderData,
            createdAt: new Date().toISOString(), // Temporary until real-time update kicks in
        } as Order;
    };

    const getOrderById = (id: string): Order | undefined => {
        return orders.find(order => order.id === id);
    };

    const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
        if (!user) throw new Error('User not authenticated');
        await UserService.updateOrderStatus(user.uid, id, status, getStatusMessage(status));
    };

    const addReview = async (orderId: string, itemId: string, review: Omit<Review, 'createdAt'>, userName?: string) => {
        if (!user) throw new Error('User not authenticated');

        const reviewData = {
            ...review,
            createdAt: new Date().toISOString()
        };

        // Find the order
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');

        const updatedItems = order.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, review: reviewData };
        });

        // STEP 1: Update the order document
        console.log('[OrderContext] STEP 1: Updating order review state...');
        try {
            const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
            await updateDoc(orderRef, { items: updatedItems });
            console.log('[OrderContext] STEP 1 Success');
        } catch (err: any) {
            console.error('[OrderContext] STEP 1 FAILED', err);
            throw err;
        }

        // STEP 2: Save to public reviews
        const item = order.items.find(i => i.id === itemId);
        if (item) {
            console.log('[OrderContext] STEP 2: Saving public review...');
            try {
                await addDoc(collection(db, 'reviews'), {
                    productId: itemId,
                    productName: item.name,
                    productImage: item.image,
                    userId: user.uid,
                    userName: userName || 'Anonymous',
                    rating: review.rating,
                    comment: review.comment,
                    images: review.images || [],
                    verified: true,
                    status: 'pending',
                    likes: 0,
                    createdAt: serverTimestamp()
                });
                console.log('[OrderContext] STEP 2 Success');
            } catch (err: any) {
                console.error('[OrderContext] STEP 2 FAILED', err);
                throw err;
            }
        }
    };

    const clearOrders = (): void => {
        setOrders([]);
    };

    return (
        <OrderContext.Provider value={{
            orders,
            loading,
            addOrder,
            getOrderById,
            updateOrderStatus,
            addReview,
            clearOrders,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
