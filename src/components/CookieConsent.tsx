'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'zcloths_cookie_consent';

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Small delay to prevent flash on initial load
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
        }));
        setShowBanner(false);
    };

    const acceptEssentialOnly = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            essential: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
        }));
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #E5E5E5',
            padding: '20px 24px',
            zIndex: 9999,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>
                        🍪 We use cookies
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: 1.6 }}>
                        We use cookies to enhance your experience, analyze site traffic, and personalize content.
                        By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                        Read our <Link href="/privacy-policy" style={{ color: '#E85D04', textDecoration: 'underline' }}>Privacy Policy</Link> for more information.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={acceptEssentialOnly}
                        style={{
                            padding: '12px 24px',
                            border: '1px solid #E5E5E5',
                            background: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Essential Only
                    </button>
                    <button
                        onClick={acceptAll}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            background: '#E85D04',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper to check consent status
export function getCookieConsent() {
    if (typeof window === 'undefined') return null;

    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return null;

    try {
        return JSON.parse(consent);
    } catch {
        return null;
    }
}

// Check if analytics consent was given
export function hasAnalyticsConsent() {
    const consent = getCookieConsent();
    return consent?.analytics === true;
}
