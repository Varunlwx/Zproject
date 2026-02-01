import {
    collection,
    query,
    where,
    getDocs,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Coupon } from '@/types/schema';

const COUPONS_COLLECTION = 'coupons';

export const CouponService = {
    /**
     * Validate a coupon code
     */
    validateCoupon: async (code: string, currentTotal: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> => {
        try {
            const q = query(
                collection(db, COUPONS_COLLECTION),
                where('code', '==', code.toUpperCase()),
                where('isActive', '==', true),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { valid: false, message: 'Invalid or inactive coupon code' };
            }

            const couponDoc = snapshot.docs[0];
            const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;

            // Check expiry
            const now = new Date();
            const expiry = coupon.expiryDate instanceof Timestamp ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);

            if (expiry < now) {
                return { valid: false, message: 'This coupon has expired' };
            }

            // Check usage limit
            if (coupon.usageCount >= coupon.usageLimit) {
                return { valid: false, message: 'This coupon has reached its usage limit' };
            }

            // Check minimum order amount
            if (currentTotal < coupon.minOrderAmount) {
                return { valid: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` };
            }

            return { valid: true, coupon };
        } catch (error) {
            console.error('[CouponService] Error validating coupon:', error);
            return { valid: false, message: 'Error validating coupon' };
        }
    },

    /**
     * Calculate discount amount
     */
    calculateDiscount: (coupon: Coupon, subtotal: number): number => {
        if (coupon.type === 'percentage') {
            return Math.floor((subtotal * coupon.value) / 100);
        } else {
            return Math.min(coupon.value, subtotal); // Fixed amount cannot exceed subtotal
        }
    }
};
