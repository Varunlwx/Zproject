'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    updateDoc
} from 'firebase/firestore';
import { useAuth } from './auth-context';
import { UserService } from '@/services/user-service';

export interface Address {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
    type?: 'home' | 'work' | 'other';
}

interface AddressContextType {
    addresses: Address[];
    loading: boolean;
    addAddress: (address: Omit<Address, 'id'>) => Promise<string>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setAddresses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = UserService.subscribeToAddresses(user.uid, (newAddresses) => {
            setAddresses(newAddresses);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addAddress = async (addressData: Omit<Address, 'id'>) => {
        if (!user) throw new Error('User not authenticated');

        // If this is the first address, make it default
        if (addresses.length === 0) {
            addressData.isDefault = true;
        }

        const docRef = await UserService.addAddress(user.uid, addressData);
        return docRef.id;
    };

    const updateAddress = async (id: string, addressData: Partial<Address>) => {
        if (!user) throw new Error('User not authenticated');
        await UserService.updateAddress(user.uid, id, addressData);
    };

    const deleteAddress = async (id: string) => {
        if (!user) throw new Error('User not authenticated');
        await UserService.deleteAddress(user.uid, id);
    };

    const setDefaultAddress = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        const promises = addresses.map(addr => {
            return UserService.updateAddress(user.uid, addr.id, { isDefault: addr.id === id });
        });

        await Promise.all(promises);
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            loading,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress
        }}>
            {children}
        </AddressContext.Provider>
    );
}

export function useAddresses() {
    const context = useContext(AddressContext);
    if (context === undefined) {
        throw new Error('useAddresses must be used within an AddressProvider');
    }
    return context;
}
