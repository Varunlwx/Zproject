'use client';

import React from 'react';

/**
 * Skeleton Components Library
 * 
 * Provides shimmer loading placeholders for all data-fetching components.
 * These create a smooth loading experience while content is being fetched.
 */

// Base skeleton with shimmer animation
export function Skeleton({
    width,
    height,
    borderRadius = '8px',
    className = ''
}: {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
}) {
    return (
        <>
            <div
                className={`skeleton ${className}`}
                style={{
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                    borderRadius
                }}
            />
            <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </>
    );
}

// Text line skeleton
export function SkeletonText({
    lines = 1,
    widths = ['100%'],
    height = 16,
    gap = 8
}: {
    lines?: number;
    widths?: string[];
    height?: number;
    gap?: number;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={widths[i % widths.length]}
                    height={height}
                    borderRadius="4px"
                />
            ))}
        </div>
    );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
    return (
        <>
            <div className="product-card-skeleton">
                <div className="skeleton-image">
                    <Skeleton width="100%" height="100%" borderRadius="12px" />
                </div>
                <div className="skeleton-content">
                    <Skeleton width="70%" height={18} borderRadius="4px" />
                    <Skeleton width="40%" height={14} borderRadius="4px" />
                    <div className="skeleton-price-row">
                        <Skeleton width="30%" height={20} borderRadius="4px" />
                        <Skeleton width="20%" height={14} borderRadius="4px" />
                    </div>
                </div>
            </div>
            <style jsx>{`
        .product-card-skeleton {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .skeleton-image {
          aspect-ratio: 3/4;
          width: 100%;
        }
        .skeleton-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .skeleton-price-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
      `}</style>
        </>
    );
}

// Product Grid Skeleton (for Shop page)
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <>
            <div className="product-grid-skeleton">
                {Array.from({ length: count }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
            <style jsx>{`
        .product-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 16px;
        }
        @media (min-width: 640px) {
          .product-grid-skeleton {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        @media (min-width: 1024px) {
          .product-grid-skeleton {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
        </>
    );
}

// Product Details Page Skeleton
export function ProductDetailsSkeleton() {
    return (
        <>
            <div className="product-details-skeleton">
                <div className="image-section">
                    <Skeleton width="100%" height="100%" borderRadius="16px" />
                    <div className="thumbnail-row">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} width={60} height={60} borderRadius="8px" />
                        ))}
                    </div>
                </div>
                <div className="info-section">
                    <Skeleton width="80%" height={32} borderRadius="6px" />
                    <Skeleton width="40%" height={20} borderRadius="4px" />
                    <div className="price-row">
                        <Skeleton width={100} height={28} borderRadius="4px" />
                        <Skeleton width={60} height={18} borderRadius="4px" />
                    </div>
                    <div className="size-section">
                        <Skeleton width={60} height={16} borderRadius="4px" />
                        <div className="size-chips">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} width={48} height={40} borderRadius="8px" />
                            ))}
                        </div>
                    </div>
                    <div className="buttons">
                        <Skeleton width="100%" height={52} borderRadius="12px" />
                        <Skeleton width="100%" height={52} borderRadius="12px" />
                    </div>
                    <div className="description">
                        <SkeletonText lines={4} widths={['100%', '100%', '100%', '60%']} />
                    </div>
                </div>
            </div>
            <style jsx>{`
        .product-details-skeleton {
          display: grid;
          gap: 32px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .product-details-skeleton {
            grid-template-columns: 1fr 1fr;
            padding: 48px;
          }
        }
        .image-section {
          aspect-ratio: 3/4;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .thumbnail-row {
          display: flex;
          gap: 12px;
        }
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .price-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .size-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        .size-chips {
          display: flex;
          gap: 8px;
        }
        .buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .description {
          margin-top: 24px;
        }
      `}</style>
        </>
    );
}

// Cart Item Skeleton
export function CartItemSkeleton() {
    return (
        <>
            <div className="cart-item-skeleton">
                <Skeleton width={100} height={120} borderRadius="12px" />
                <div className="cart-item-info">
                    <Skeleton width="70%" height={18} borderRadius="4px" />
                    <Skeleton width="40%" height={14} borderRadius="4px" />
                    <div className="cart-item-bottom">
                        <Skeleton width={80} height={32} borderRadius="8px" />
                        <Skeleton width={60} height={20} borderRadius="4px" />
                    </div>
                </div>
            </div>
            <style jsx>{`
        .cart-item-skeleton {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cart-item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
      `}</style>
        </>
    );
}

// Cart Page Skeleton
export function CartPageSkeleton() {
    return (
        <>
            <div className="cart-page-skeleton">
                <div className="cart-items">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <CartItemSkeleton key={i} />
                    ))}
                </div>
                <div className="cart-summary">
                    <Skeleton width="100%" height={200} borderRadius="16px" />
                </div>
            </div>
            <style jsx>{`
        .cart-page-skeleton {
          display: grid;
          gap: 24px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .cart-page-skeleton {
            grid-template-columns: 2fr 1fr;
          }
        }
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
        </>
    );
}

// Wishlist Page Skeleton
export function WishlistPageSkeleton() {
    return (
        <ProductGridSkeleton count={6} />
    );
}

// Order Card Skeleton
export function OrderCardSkeleton() {
    return (
        <>
            <div className="order-card-skeleton">
                <div className="order-header">
                    <Skeleton width={120} height={18} borderRadius="4px" />
                    <Skeleton width={80} height={24} borderRadius="20px" />
                </div>
                <div className="order-items">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="order-item">
                            <Skeleton width={60} height={60} borderRadius="8px" />
                            <div className="order-item-info">
                                <Skeleton width="60%" height={14} borderRadius="4px" />
                                <Skeleton width="30%" height={12} borderRadius="4px" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="order-footer">
                    <Skeleton width={100} height={16} borderRadius="4px" />
                    <Skeleton width={80} height={18} borderRadius="4px" />
                </div>
            </div>
            <style jsx>{`
        .order-card-skeleton {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .order-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        .order-item {
          display: flex;
          gap: 12px;
        }
        .order-item-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }
      `}</style>
        </>
    );
}

// Profile Page Skeleton
export function ProfilePageSkeleton() {
    return (
        <>
            <div className="profile-skeleton">
                <div className="profile-header">
                    <Skeleton width={80} height={80} borderRadius="50%" />
                    <div className="profile-info">
                        <Skeleton width={150} height={24} borderRadius="4px" />
                        <Skeleton width={200} height={16} borderRadius="4px" />
                    </div>
                </div>
                <div className="orders-section">
                    <Skeleton width={120} height={24} borderRadius="4px" />
                    <div className="orders-list">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <OrderCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
        .profile-skeleton {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }
        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .orders-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
        </>
    );
}

// Admin Dashboard Skeleton
export function AdminDashboardSkeleton() {
    return (
        <>
            <div className="admin-skeleton">
                <div className="stats-row">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="stat-card">
                            <Skeleton width="60%" height={16} borderRadius="4px" />
                            <Skeleton width="40%" height={32} borderRadius="6px" />
                        </div>
                    ))}
                </div>
                <div className="admin-content">
                    <div className="table-skeleton">
                        <Skeleton width="100%" height={48} borderRadius="8px 8px 0 0" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="table-row">
                                <Skeleton width="100%" height={56} borderRadius="0" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
        .admin-skeleton {
          padding: 24px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (min-width: 768px) {
          .stats-row {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .table-skeleton {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .table-row {
          border-top: 1px solid #f0f0f0;
        }
      `}</style>
        </>
    );
}

// Hero Section Skeleton
export function HeroSkeleton() {
    return (
        <>
            <div className="hero-skeleton">
                <div className="hero-content">
                    <Skeleton width="60%" height={48} borderRadius="8px" />
                    <Skeleton width="80%" height={20} borderRadius="4px" />
                    <Skeleton width="40%" height={20} borderRadius="4px" />
                    <div className="hero-buttons">
                        <Skeleton width={140} height={48} borderRadius="30px" />
                        <Skeleton width={160} height={48} borderRadius="30px" />
                    </div>
                </div>
            </div>
            <style jsx>{`
        .hero-skeleton {
          min-height: 500px;
          display: flex;
          align-items: center;
          padding: 48px 24px;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 600px;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          margin-top: 16px;
        }
      `}</style>
        </>
    );
}

// Similar Products Section Skeleton
export function SimilarProductsSkeleton() {
    return (
        <>
            <div className="similar-products-skeleton">
                <Skeleton width={180} height={28} borderRadius="6px" />
                <div className="similar-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
            <style jsx>{`
        .similar-products-skeleton {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .similar-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }
        @media (min-width: 768px) {
          .similar-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
        </>
    );
}
