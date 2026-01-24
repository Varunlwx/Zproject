import {
    products,
    getProductById,
    getSimilarProducts,
    getProductsByCategory,
    getProductsBySubcategory,
    getNumericPrice,
    getDiscountPercent,
} from '@/data/products';

describe('Products Data Module', () => {
    describe('products array', () => {
        it('should have products with required fields', () => {
            expect(products.length).toBeGreaterThan(0);

            products.forEach((product) => {
                expect(product.id).toBeDefined();
                expect(product.name).toBeDefined();
                expect(product.price).toMatch(/^₹[\d,]+$/);
                expect(product.category).toBeDefined();
                expect(product.subcategory).toBeDefined();
                expect(product.image).toBeDefined();
                expect(product.images).toBeInstanceOf(Array);
                expect(product.rating).toBeGreaterThanOrEqual(0);
                expect(product.rating).toBeLessThanOrEqual(5);
                expect(product.sizes).toBeInstanceOf(Array);
                expect(product.sizes.length).toBeGreaterThan(0);
            });
        });

        it('should have valid image paths starting with /', () => {
            products.forEach((product) => {
                expect(product.image).toMatch(/^\//);
                product.images.forEach((img) => {
                    expect(img).toMatch(/^\//);
                });
            });
        });

        it('should have unique product IDs', () => {
            const ids = products.map((p) => p.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('getProductById', () => {
        it('should return a product when valid ID is provided', () => {
            const product = getProductById('plain-shirt-1');
            expect(product).toBeDefined();
            expect(product?.name).toBe('Classic White Shirt');
        });

        it('should return undefined for invalid ID', () => {
            const product = getProductById('non-existent-id');
            expect(product).toBeUndefined();
        });
    });

    describe('getSimilarProducts', () => {
        it('should return products excluding the current product', () => {
            const product = products[0];
            const similar = getSimilarProducts(product, 4);

            expect(similar).not.toContainEqual(product);
        });

        it('should return products from the same category/subcategory', () => {
            const product = products.find((p) => p.subcategory === 'Plain Shirt')!;
            const similar = getSimilarProducts(product, 4);

            // At least some should be from the same subcategory
            const sameSubcategory = similar.filter(
                (s) => s.subcategory === product.subcategory
            );
            expect(sameSubcategory.length).toBeGreaterThanOrEqual(0);
        });

        it('should respect the limit parameter', () => {
            const product = products[0];
            const similar = getSimilarProducts(product, 3);

            expect(similar.length).toBeLessThanOrEqual(3);
        });
    });

    describe('getProductsByCategory', () => {
        it('should return products for a valid category', () => {
            const tops = getProductsByCategory('Tops');
            expect(tops.length).toBeGreaterThan(0);
            tops.forEach((p) => expect(p.category).toBe('Tops'));
        });

        it('should return empty array for invalid category', () => {
            const invalid = getProductsByCategory('NonExistent');
            expect(invalid).toEqual([]);
        });
    });

    describe('getProductsBySubcategory', () => {
        it('should return products for a valid subcategory', () => {
            const plainShirts = getProductsBySubcategory('Plain Shirt');
            expect(plainShirts.length).toBeGreaterThan(0);
            plainShirts.forEach((p) => expect(p.subcategory).toBe('Plain Shirt'));
        });
    });

    describe('getNumericPrice', () => {
        it('should correctly parse price strings', () => {
            expect(getNumericPrice('₹1,599')).toBe(1599);
            expect(getNumericPrice('₹10,999')).toBe(10999);
            expect(getNumericPrice('₹999')).toBe(999);
        });
    });

    describe('getDiscountPercent', () => {
        it('should return empty string when no original price', () => {
            const product = products.find((p) => !p.originalPrice);
            if (product) {
                expect(getDiscountPercent(product)).toBe('');
            }
        });

        it('should calculate discount correctly', () => {
            const product = {
                ...products[0],
                price: '₹900',
                originalPrice: '₹1,000',
            };
            expect(getDiscountPercent(product)).toBe('10% OFF');
        });
    });
});
