'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Toast types
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    icon?: 'cart' | 'heart' | 'default';
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, icon?: Toast['icon']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast duration in milliseconds
const TOAST_DURATION = 2500;

/**
 * ToastProvider Component
 * 
 * Provides centralized toast notification functionality.
 * Replaces duplicate toast implementations in cart and wishlist contexts.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success', icon: Toast['icon'] = 'default') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, icon }]);

        // Auto-remove toast after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, TOAST_DURATION);
    }, []);

    const getIcon = (toast: Toast) => {
        if (toast.icon === 'cart') {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            );
        }
        if (toast.icon === 'heart') {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            );
        }
        // Default checkmark icon
        if (toast.type === 'success') {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            );
        }
        if (toast.type === 'error') {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        }
        // Info icon
        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        );
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {getIcon(toast)}
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .toast-container {
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    pointer-events: none;
                }
                @media (min-width: 768px) {
                    .toast-container {
                        bottom: 40px;
                    }
                }
                .toast {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 20px;
                    background: #1A1A1A;
                    color: white;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    animation: toastSlideUp 0.3s ease-out;
                    white-space: nowrap;
                }
                .toast-success svg {
                    color: #22C55E;
                }
                .toast-error svg {
                    color: #DC2626;
                }
                .toast-info svg {
                    color: #3B82F6;
                }
                @keyframes toastSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

/**
 * useToast Hook
 * 
 * Provides access to toast notification functionality.
 * Must be used within a ToastProvider.
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
