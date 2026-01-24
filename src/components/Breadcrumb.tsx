'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Reusable Breadcrumb component for consistent navigation across pages.
 * 
 * Usage:
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Shop', href: '/shop' },
 *   { label: 'Kurtas' }  // Last item has no href (current page)
 * ]} />
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <nav className={`breadcrumb ${className}`}>
            {items.map((item, index) => (
                <span key={index}>
                    {index > 0 && <span className="separator">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="breadcrumb-link">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                </span>
            ))}

            <style jsx>{`
                .breadcrumb {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                    font-size: 12px;
                    margin-bottom: 8px;
                }
                .separator {
                    color: #6B6B6B;
                    margin: 0 2px;
                }
                .breadcrumb-current {
                    color: #6B6B6B;
                }
            `}</style>
            <style jsx global>{`
                .breadcrumb .breadcrumb-link {
                    color: #6B6B6B;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .breadcrumb .breadcrumb-link:hover {
                    color: #E85D04;
                }
            `}</style>
        </nav>
    );
}
