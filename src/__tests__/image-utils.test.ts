/**
 * Image Path Utility Tests
 * Tests for image path normalization and validation
 */

// Helper function to normalize image paths (as used in components)
const normalizeImagePath = (path: string | undefined): string => {
    if (!path) return '/images/products/placeholder.jpg';
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return `/${path}`;
};

// Helper to detect invalid asset paths from Firebase
const isValidImagePath = (path: string): boolean => {
    // Valid paths should NOT contain /assets/ prefix
    return !path.includes('/assets/images/');
};

describe('Image Path Utilities', () => {
    describe('normalizeImagePath', () => {
        it('should return placeholder for undefined', () => {
            expect(normalizeImagePath(undefined)).toBe('/images/products/placeholder.jpg');
        });

        it('should return placeholder for empty string', () => {
            expect(normalizeImagePath('')).toBe('/images/products/placeholder.jpg');
        });

        it('should return path as-is if starts with /', () => {
            expect(normalizeImagePath('/images/products/test.jpg')).toBe('/images/products/test.jpg');
        });

        it('should return path as-is if starts with http', () => {
            expect(normalizeImagePath('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
        });

        it('should prepend / if path does not start with / or http', () => {
            expect(normalizeImagePath('images/products/test.jpg')).toBe('/images/products/test.jpg');
        });
    });

    describe('isValidImagePath', () => {
        it('should return true for valid paths', () => {
            expect(isValidImagePath('/images/products/Shirt-1.jpg')).toBe(true);
            expect(isValidImagePath('/images/products/Hoddie-1.jpg')).toBe(true);
        });

        it('should return false for paths with /assets/ prefix', () => {
            expect(isValidImagePath('/assets/images/products/Hoddie-1.jpg')).toBe(false);
        });
    });
});

describe('Product Image Paths Validation', () => {
    it('should detect the known issue with Firebase data', () => {
        // This test documents the known issue where Firebase products
        // have incorrect /assets/images/ paths
        const problematicPath = '/assets/images/products/Hoddie-1.jpg';
        const correctPath = '/images/products/Hoddie-1.jpg';

        expect(isValidImagePath(problematicPath)).toBe(false);
        expect(isValidImagePath(correctPath)).toBe(true);

        // The fix should remove /assets prefix
        const fixedPath = problematicPath.replace('/assets/', '/');
        expect(fixedPath).toBe(correctPath);
    });
});
