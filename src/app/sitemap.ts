import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zcloths.com';

    // Static pages
    const staticPages = [
        '',
        '/shop',
        '/about',
        '/login',
        '/signup',
        '/cart',
        '/wishlist',
        '/privacy-policy',
        '/terms',
        '/refund-policy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // TODO: Add dynamic product pages from Firestore
    // const products = await getProducts();
    // const productPages = products.map((product) => ({
    //   url: `${baseUrl}/product/${product.id}`,
    //   lastModified: new Date(product.updatedAt),
    //   changeFrequency: 'daily' as const,
    //   priority: 0.6,
    // }));

    return [
        ...staticPages,
        // ...productPages,
    ];
}
