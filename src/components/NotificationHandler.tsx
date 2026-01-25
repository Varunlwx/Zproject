'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { requestNotificationPermission, onMessageListener } from '@/lib/push-notifications';
import { useToast } from '@/contexts/toast-context';

export function NotificationHandler() {
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            // Request permission and sync token
            requestNotificationPermission();

            // Listen for foreground messages
            const setupListener = async () => {
                const payload = await onMessageListener();
                if (payload) {
                    const body = (payload as any).notification?.body || (payload as any).notification?.title || 'New notification';
                    showToast(body, 'info');
                }
            };

            setupListener();
        }
    }, [user, showToast]);

    return null; // This component doesn't render anything
}
