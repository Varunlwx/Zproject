import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zcloths.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/checkout',
                    '/order-confirmation/',
                    '/profile',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
