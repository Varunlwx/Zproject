'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round" />
                        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
                <div className="error-actions">
                    <Link href="/" className="primary-btn">
                        Go Home
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </Link>
                    <Link href="/shop" className="secondary-btn">
                        Browse Shop
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
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
                    background: rgba(232, 93, 4, 0.1);
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
                    text-decoration: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
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
