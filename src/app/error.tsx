'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h1>500</h1>
                <h2>Something Went Wrong</h2>
                <p>We apologize for the inconvenience. An unexpected error occurred. Please try again.</p>
                <div className="error-actions">
                    <button onClick={reset} className="primary-btn">
                        Try Again
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                    </button>
                    <a href="/" className="secondary-btn">
                        Go Home
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </a>
                </div>
            </div>

            <style jsx>{`
                .error-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #FAFAFA;
                    padding: 24px;
                }
                .error-content {
                    text-align: center;
                    max-width: 480px;
                }
                .error-icon {
                    width: 140px;
                    height: 140px;
                    margin: 0 auto 32px;
                    background: rgba(220, 38, 38, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                h1 {
                    font-size: 80px;
                    font-weight: 800;
                    color: #1A1A1A;
                    margin: 0;
                    line-height: 1;
                }
                h2 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1A1A1A;
                    margin: 8px 0 16px;
                }
                p {
                    font-size: 15px;
                    color: #6B6B6B;
                    line-height: 1.6;
                    margin: 0 0 32px;
                }
                .error-actions {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 28px;
                    background: #E85D04;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .primary-btn:hover {
                    background: #1A1A1A;
                    transform: translateY(-2px);
                }
                .secondary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 28px;
                    background: white;
                    color: #1A1A1A;
                    text-decoration: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    border: 2px solid #E5E5E5;
                    transition: all 0.2s;
                }
                .secondary-btn:hover {
                    border-color: #1A1A1A;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
