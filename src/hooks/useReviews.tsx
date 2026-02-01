'use client';

import useSWR from 'swr';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PublicReview {
    id: string;
    productName: string;
    productImage: string;
    rating: number;
    comment: string;
    images: string[];
    userName: string;
    verified: boolean;
    createdAt: any; // Firestore Timestamp
}

/**
 * Fetcher function for SWR to get reviews from Firestore
 */
const reviewsFetcher = async () => {
    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(
        reviewsRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    const snapshot = await getDocs(reviewsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PublicReview));
};

export function useReviews() {
    const { data, error, isLoading, mutate } = useSWR('public-reviews', reviewsFetcher, {
        revalidateOnFocus: false, // Don't refetch when user switches back to tab
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // Cache for 1 minute
    });

    return {
        reviews: data || [],
        loading: isLoading,
        error,
        refreshReviews: mutate
    };
}
