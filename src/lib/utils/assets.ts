/**
 * Utility to handle CDN asset prefixing.
 * In production, static assets can be served from a CDN for better global performance.
 */

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || '';

export const getAssetUrl = (path: string): string => {
    if (path.startsWith('http') || path.startsWith('//')) {
        return path;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${CDN_URL}${normalizedPath}`;
};
