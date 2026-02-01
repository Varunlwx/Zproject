/**
 * Authentication Middleware for API Routes
 * 
 * Provides Firebase ID token verification for protected API endpoints
 * 
 * Usage:
 * ```typescript
 * import { verifyAuth, requireAuth } from '@/lib/auth-middleware';
 * 
 * export async function POST(request: NextRequest) {
 *     const user = await requireAuth(request);
 *     // user is guaranteed to be authenticated here
 * }
 * ```
 */

import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';

const isDev = process.env.NODE_ENV === 'development';

export interface AuthenticatedUser {
    uid: string;
    email: string | undefined;
    emailVerified: boolean;
}

/**
 * Verify Firebase ID token from Authorization header
 * Returns user info if valid, null if invalid/missing
 */
export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            if (isDev) console.log('Auth: No Bearer token in Authorization header');
            return null;
        }

        const token = authHeader.substring(7);
        if (isDev) console.log('Auth: Token received, length:', token.length);

        const decodedToken = await verifyIdToken(token);
        if (isDev) console.log('Auth: Token verified for user:', decodedToken.uid);

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified || false,
        };
    } catch (error) {
        if (isDev) {
            console.error('Auth verification error:', error);
            console.error('Auth: Token verification failed -', (error as Error).message);
        }
        return null;
    }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this when endpoint MUST have authenticated user
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
    const user = await verifyAuth(request);

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}

/**
 * Get optional user from request
 * Returns user if authenticated, null otherwise (no error)
 */
export async function getOptionalUser(request: NextRequest): Promise<AuthenticatedUser | null> {
    return verifyAuth(request);
}
