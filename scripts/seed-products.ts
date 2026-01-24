// Script to seed Firestore with products from static data
// Run with: npx ts-node --project tsconfig.json scripts/seed-products.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from '../src/data/products';

// Initialize Firebase Admin (requires service account)
// You need to download your service account key from Firebase Console
// and set the path in GOOGLE_APPLICATION_CREDENTIALS environment variable

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccount) {
    console.log(`
========================================
SETUP REQUIRED
========================================

To run this seed script, you need to:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key" and download the JSON file
3. Set the environment variable:
   
   Windows (PowerShell):
   $env:GOOGLE_APPLICATION_CREDENTIALS="path/to/your-service-account.json"
   
   Mac/Linux:
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your-service-account.json"

4. Run this script again:
   npx ts-node scripts/seed-products.ts

========================================

ALTERNATIVE: Manual Firestore Setup
========================================

You can also manually add products in Firebase Console:
1. Go to Firebase Console > Firestore Database
2. Create a collection called "products"
3. Add documents with IDs matching product IDs (e.g., "plain-shirt-1")
4. Each document should have all product fields (name, price, category, etc.)

The app will automatically use static data as fallback if Firestore is empty.
`);
    process.exit(0);
}

initializeApp({
    credential: cert(serviceAccount as string),
});

const db = getFirestore();

async function seedProducts() {
    console.log('Starting product seeding...');
    console.log(`Found ${products.length} products to seed`);

    const batch = db.batch();
    const productsRef = db.collection('products');

    for (const product of products) {
        const docRef = productsRef.doc(product.id);
        batch.set(docRef, {
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || '',
            tag: product.tag || '',
            category: product.category,
            subcategory: product.subcategory,
            image: product.image,
            images: product.images,
            rating: product.rating,
            reviewCount: product.reviewCount,
            description: product.description,
            sizes: product.sizes,
        });
        console.log(`  Added: ${product.name}`);
    }

    await batch.commit();
    console.log('\n✅ Successfully seeded all products to Firestore!');
}

seedProducts().catch((error) => {
    console.error('Error seeding products:', error);
    process.exit(1);
});
