import { db } from '@/lib/firebase';
import { doc, updateDoc, runTransaction, getDoc } from 'firebase/firestore';

/**
 * Stock Management Service
 * Handles all stock-related operations including validation and updates
 */

export interface StockUpdate {
    productId: string;
    size: string;
    quantity: number;
}

export const StockService = {
    /**
     * Get total stock for a product (sum of all sizes)
     */
    getTotalStock: (stock?: { [size: string]: number }): number => {
        if (!stock) return 0;
        return Object.values(stock).reduce((sum, qty) => sum + qty, 0);
    },

    /**
     * Check if a specific size is in stock
     */
    isInStock: (stock?: { [size: string]: number }, size?: string): boolean => {
        if (!stock || !size) return false;
        return (stock[size] || 0) > 0;
    },

    /**
     * Get stock quantity for a specific size
     */
    getStockForSize: (stock?: { [size: string]: number }, size?: string): number => {
        if (!stock || !size) return 0;
        return stock[size] || 0;
    },

    /**
     * Check if product has low stock (total < 10)
     */
    hasLowStock: (stock?: { [size: string]: number }): boolean => {
        const total = StockService.getTotalStock(stock);
        return total > 0 && total < 10;
    },

    /**
     * Check if product is out of stock (total = 0)
     */
    isOutOfStock: (stock?: { [size: string]: number }): boolean => {
        return StockService.getTotalStock(stock) === 0;
    },

    /**
     * Validate if order quantity is available
     */
    validateAvailability: async (
        productId: string,
        size: string,
        requestedQuantity: number
    ): Promise<{ available: boolean; currentStock: number; message?: string }> => {
        try {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);

            if (!productSnap.exists()) {
                return {
                    available: false,
                    currentStock: 0,
                    message: 'Product not found'
                };
            }

            const product = productSnap.data();
            const stock = product?.stock || {};
            const currentStock = stock[size] || 0;

            if (currentStock < requestedQuantity) {
                return {
                    available: false,
                    currentStock,
                    message: currentStock === 0
                        ? `Size ${size} is out of stock`
                        : `Only ${currentStock} items available for size ${size}`
                };
            }

            return {
                available: true,
                currentStock
            };
        } catch (error) {
            console.error('[StockService] Error validating availability:', error);
            return {
                available: false,
                currentStock: 0,
                message: 'Error checking stock availability'
            };
        }
    },

    /**
     * Reduce stock for an order (atomic transaction)
     * Returns success status and updated stock
     */
    reduceStock: async (
        productId: string,
        size: string,
        quantity: number
    ): Promise<{ success: boolean; message?: string; newStock?: number }> => {
        try {
            const productRef = doc(db, 'products', productId);

            const result = await runTransaction(db, async (transaction) => {
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error('Product not found');
                }

                const product = productDoc.data();
                const currentStock = product?.stock || {};
                const currentQty = currentStock[size] || 0;

                // Validate stock availability
                if (currentQty < quantity) {
                    throw new Error(
                        currentQty === 0
                            ? `Size ${size} is out of stock`
                            : `Insufficient stock. Only ${currentQty} available`
                    );
                }

                // Calculate new stock
                const newQty = currentQty - quantity;
                const updatedStock = {
                    ...currentStock,
                    [size]: newQty
                };

                //Update product with new stock
                transaction.update(productRef, {
                    stock: updatedStock,
                    updatedAt: new Date().toISOString()
                });

                return newQty;
            });

            return {
                success: true,
                newStock: result
            };
        } catch (error: any) {
            console.error('[StockService] Error reducing stock:', error);
            return {
                success: false,
                message: error.message || 'Failed to update stock'
            };
        }
    },

    /**
     * Increase stock (for restocking or order cancellation)
     */
    increaseStock: async (
        productId: string,
        size: string,
        quantity: number
    ): Promise<{ success: boolean; message?: string }> => {
        try {
            const productRef = doc(db, 'products', productId);

            await runTransaction(db, async (transaction) => {
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error('Product not found');
                }

                const product = productDoc.data();
                const currentStock = product?.stock || {};
                const currentQty = currentStock[size] || 0;
                const newQty = currentQty + quantity;

                const updatedStock = {
                    ...currentStock,
                    [size]: newQty
                };

                transaction.update(productRef, {
                    stock: updatedStock,
                    updatedAt: new Date().toISOString()
                });
            });

            return { success: true };
        } catch (error: any) {
            console.error('[StockService] Error increasing stock:', error);
            return {
                success: false,
                message: error.message || 'Failed to update stock'
            };
        }
    },

    /**
     * Batch reduce stock for multiple products (for orders with multiple items)
     */
    batchReduceStock: async (
        items: StockUpdate[]
    ): Promise<{ success: boolean; message?: string; failedItems?: StockUpdate[] }> => {
        const failedItems: StockUpdate[] = [];

        for (const item of items) {
            const result = await StockService.reduceStock(
                item.productId,
                item.size,
                item.quantity
            );

            if (!result.success) {
                failedItems.push(item);
            }
        }

        if (failedItems.length > 0) {
            return {
                success: false,
                message: `Failed to reduce stock for ${failedItems.length} item(s)`,
                failedItems
            };
        }

        return { success: true };
    },

    /**
     * Get stock status for display
     */
    getStockStatus: (stock?: { [size: string]: number }): {
        status: 'out_of_stock' | 'low_stock' | 'in_stock';
        color: 'red' | 'yellow' | 'green';
        label: string;
        total: number;
    } => {
        const total = StockService.getTotalStock(stock);

        if (total === 0) {
            return {
                status: 'out_of_stock',
                color: 'red',
                label: 'Out of Stock',
                total: 0
            };
        }

        if (total < 10) {
            return {
                status: 'low_stock',
                color: 'yellow',
                label: 'Low Stock',
                total
            };
        }

        return {
            status: 'in_stock',
            color: 'green',
            label: 'In Stock',
            total
        };
    }
};
