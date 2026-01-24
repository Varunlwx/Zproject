'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
    items: T[];
    batchSize?: number;
}

interface UseInfiniteScrollReturn<T> {
    displayedItems: T[];
    hasMore: boolean;
    loadingMore: boolean;
    loaderRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll<T>({
    items,
    batchSize = 12,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
    const [displayCount, setDisplayCount] = useState(batchSize);
    const [loadingMore, setLoadingMore] = useState(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    // Reset display count when items change (e.g., filter applied)
    useEffect(() => {
        setDisplayCount(batchSize);
    }, [items, batchSize]);

    const hasMore = displayCount < items.length;
    const displayedItems = items.slice(0, displayCount);

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        // Small delay to show loading state
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + batchSize, items.length));
            setLoadingMore(false);
        }, 300);
    }, [loadingMore, hasMore, batchSize, items.length]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const loader = loaderRef.current;
        if (!loader) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loader);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loadingMore, loadMore]);

    return {
        displayedItems,
        hasMore,
        loadingMore,
        loaderRef,
    };
}
