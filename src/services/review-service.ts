import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/types/schema';

const REVIEWS_COLLECTION = 'reviews';

export const ReviewService = {
    /**
     * Submit a new review
     */
    addReview: async (reviewData: Omit<Review, 'id' | 'createdAt' | 'status' | 'likes' | 'verified'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
                ...reviewData,
                status: 'pending', // All new reviews start as pending
                likes: 0,
                verified: true, // Assuming only customers who bought can review (simplified)
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('[ReviewService] Error adding review:', error);
            throw error;
        }
    },

    /**
     * Get approved reviews for a product with 4+ star rating
     */
    getApprovedReviews: async (productId: string): Promise<Review[]> => {
        try {
            const q = query(
                collection(db, REVIEWS_COLLECTION),
                where('productId', '==', productId),
                where('status', '==', 'approved'),
                where('rating', '>=', 4),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            } as Review));
        } catch (error) {
            console.error('[ReviewService] Error fetching reviews:', error);
            return [];
        }
    }
};
