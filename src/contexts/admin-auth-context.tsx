'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AdminAuthContextType {
    isAdminAuthenticated: boolean;
    isLoading: boolean;
    adminLogin: (adminId: string, password: string) => Promise<boolean>;
    adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check localStorage on mount for existing session
    useEffect(() => {
        const session = localStorage.getItem('adminSession');
        if (session) {
            try {
                const { expiry } = JSON.parse(session);
                if (new Date().getTime() < expiry) {
                    setIsAdminAuthenticated(true);
                } else {
                    localStorage.removeItem('adminSession');
                }
            } catch {
                localStorage.removeItem('adminSession');
            }
        }
        setIsLoading(false);
    }, []);

    // Initialize default admin credentials in Firestore if not exists
    useEffect(() => {
        const initializeAdmin = async () => {
            try {
                const adminRef = doc(db, 'admins', 'Zclothsadmin');
                const adminDoc = await getDoc(adminRef);

                if (!adminDoc.exists()) {
                    await setDoc(adminRef, {
                        adminId: 'Zclothsadmin',
                        password: 'Admin123',
                        createdAt: new Date()
                    });
                }
            } catch (error) {
                console.error('Error initializing admin:', error);
            }
        };
        initializeAdmin();
    }, []);

    const adminLogin = async (adminId: string, password: string): Promise<boolean> => {
        try {
            const adminRef = doc(db, 'admins', adminId);
            const adminDoc = await getDoc(adminRef);

            if (adminDoc.exists()) {
                const adminData = adminDoc.data();
                if (adminData.password === password) {
                    // Create session with 24 hour expiry
                    const session = {
                        adminId,
                        expiry: new Date().getTime() + 24 * 60 * 60 * 1000
                    };
                    localStorage.setItem('adminSession', JSON.stringify(session));
                    setIsAdminAuthenticated(true);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Admin login error:', error);
            return false;
        }
    };

    const adminLogout = () => {
        localStorage.removeItem('adminSession');
        setIsAdminAuthenticated(false);
    };

    return (
        <AdminAuthContext.Provider value={{ isAdminAuthenticated, isLoading, adminLogin, adminLogout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
