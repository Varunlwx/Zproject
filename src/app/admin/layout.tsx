'use client';

import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminAuthProvider>
            {children}
        </AdminAuthProvider>
    );
}
