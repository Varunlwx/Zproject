'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
function usePageTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // @ts-expect-error - gtag is added by the script
        window.gtag?.('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }, [pathname, searchParams]);
}

function AnalyticsContent() {
    usePageTracking();
    return null;
}

export function Analytics() {
    if (!GA_MEASUREMENT_ID) {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
            <Suspense fallback={null}>
                <AnalyticsContent />
            </Suspense>
        </>
    );
}

// Track custom events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

    // @ts-expect-error - gtag is added by the script
    window.gtag?.('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
}

// Pre-built e-commerce events
export const ecommerceEvents = {
    viewItem: (item: { id: string; name: string; price: number }) => {
        trackEvent('view_item', 'ecommerce', item.name, item.price);
    },

    addToCart: (item: { id: string; name: string; price: number; quantity: number }) => {
        trackEvent('add_to_cart', 'ecommerce', item.name, item.price * item.quantity);
    },

    removeFromCart: (item: { id: string; name: string }) => {
        trackEvent('remove_from_cart', 'ecommerce', item.name);
    },

    beginCheckout: (value: number) => {
        trackEvent('begin_checkout', 'ecommerce', undefined, value);
    },

    purchase: (orderId: string, value: number) => {
        trackEvent('purchase', 'ecommerce', orderId, value);
    },

    addToWishlist: (item: { id: string; name: string }) => {
        trackEvent('add_to_wishlist', 'ecommerce', item.name);
    },
};
