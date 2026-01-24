import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    QuerySnapshot,
    DocumentData,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Address } from '@/contexts/address-context';
import { Order, OrderStatus } from '@/contexts/order-context';
import { CartItem } from '@/types';

export const UserService = {
    // Address Operations
    subscribeToAddresses: (uid: string, callback: (addresses: Address[]) => void) => {
        console.log('[UserService] Subscribing to addresses for user:', uid);
        const q = query(collection(db, `users/${uid}/addresses`));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const addresses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Address));
            console.log('[UserService] Received addresses from Firestore:', addresses.length);
            callback(addresses);
        }, (error) => {
            console.error('[UserService] Error in subscribeToAddresses:', error);
        });
    },

    addAddress: async (uid: string, address: Omit<Address, 'id'>) => {
        console.log('[UserService] Adding address for user:', uid, address);
        try {
            const docRef = await addDoc(collection(db, `users/${uid}/addresses`), address);
            console.log('[UserService] Address added successfully with ID:', docRef.id);
            return docRef;
        } catch (error) {
            console.error('[UserService] Error adding address:', error);
            throw error;
        }
    },

    updateAddress: async (uid: string, addressId: string, address: Partial<Address>) => {
        console.log('[UserService] Updating address:', addressId, 'for user:', uid);
        try {
            const addressRef = doc(db, `users/${uid}/addresses`, addressId);
            await updateDoc(addressRef, address);
            console.log('[UserService] Address updated successfully');
        } catch (error) {
            console.error('[UserService] Error updating address:', error);
            throw error;
        }
    },

    deleteAddress: async (uid: string, addressId: string) => {
        console.log('[UserService] Deleting address:', addressId, 'for user:', uid);
        try {
            const addressRef = doc(db, `users/${uid}/addresses`, addressId);
            await deleteDoc(addressRef);
            console.log('[UserService] Address deleted successfully');
        } catch (error) {
            console.error('[UserService] Error deleting address:', error);
            throw error;
        }
    },

    // Order Operations
    subscribeToOrders: (uid: string, callback: (orders: Order[]) => void) => {
        const q = query(
            collection(db, `users/${uid}/orders`),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const orders = snapshot.docs.map(docSnap => {
                    const data = docSnap.data();

                    const createdAt =
                        data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate().toISOString()
                            : (typeof data.createdAt === 'string' ? data.createdAt : new Date(0).toISOString());

                    // Be defensive: older docs / partial writes can have missing fields.
                    const items = Array.isArray(data.items) ? data.items : [];
                    const subtotal = typeof data.subtotal === 'number' ? data.subtotal : 0;
                    const deliveryFee = typeof data.deliveryFee === 'number' ? data.deliveryFee : 0;
                    const discount = typeof data.discount === 'number' ? data.discount : 0;
                    const total = typeof data.total === 'number' ? data.total : 0;
                    const status = (data.status as OrderStatus) || 'processing';
                    const statusMessage = typeof data.statusMessage === 'string' ? data.statusMessage : '';

                    return {
                        id: docSnap.id,
                        ...data,
                        items,
                        subtotal,
                        deliveryFee,
                        discount,
                        total,
                        status,
                        statusMessage,
                        createdAt,
                    } as Order;
                });
                callback(orders);
            },
            (error) => {
                // Important: without this, Firestore permission/index errors can become unhandled and crash the page.
                console.error('[UserService] Error in subscribeToOrders:', error);
                callback([]);
            }
        );
    },

    addOrder: async (uid: string, order: Omit<Order, 'id' | 'createdAt'>) => {
        const orderData = {
            ...order,
            createdAt: serverTimestamp()
        };
        return await addDoc(collection(db, `users/${uid}/orders`), orderData);
    },

    updateOrderStatus: async (uid: string, orderId: string, status: OrderStatus, statusMessage: string) => {
        const orderRef = doc(db, `users/${uid}/orders`, orderId);
        return await updateDoc(orderRef, { status, statusMessage });
    },

    // Cart Operations
    subscribeToCart: (uid: string, callback: (items: CartItem[]) => void) => {
        const cartRef = doc(db, `users/${uid}/cart`, 'items');
        return onSnapshot(
            cartRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const items = Array.isArray(data.items) ? data.items : [];
                    callback(items as CartItem[]);
                } else {
                    callback([]);
                }
            },
            (error) => {
                console.error('[UserService] Error in subscribeToCart:', error);
                callback([]);
            }
        );
    },

    setCart: async (uid: string, items: CartItem[]) => {
        const cartRef = doc(db, `users/${uid}/cart`, 'items');
        await setDoc(cartRef, { items, updatedAt: serverTimestamp() });
    },

    clearCart: async (uid: string) => {
        const cartRef = doc(db, `users/${uid}/cart`, 'items');
        await deleteDoc(cartRef);
    }
};
