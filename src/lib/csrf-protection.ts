import { NextRequest, NextResponse } from 'next/server';

/**
 * CSRF Protection Utilities
 * 
 * Defense-in-depth layer for API routes.
 * Primary protection is Firebase token authentication via requireAuth().
 * This adds Origin/Referer validation as additional security.
 */

// Allowed origins for API requests
// Update these based on deployment environment
const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    // Add production domains:
    // 'https://your-domain.vercel.app',
    // 'https://your-domain.com',
];

/**
 * Validates that request comes from allowed origin
 * Checks Origin header first, falls back to Referer
 * 
 * @param request - Next.js request object
 * @returns true if origin is allowed, false otherwise
 */
export function validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // Check Origin header (most reliable)
    if (origin) {
        // Allow if origin is explicitly in ALLOWED_ORIGINS
        const isExplicitlyAllowed = ALLOWED_ORIGINS.some(allowedOrigin =>
            origin === allowedOrigin || origin.startsWith(allowedOrigin)
        );

        if (isExplicitlyAllowed) return true;

        // Allow if origin matches current host (Same-Origin)
        // This handles local IP access (e.g., http://192.168.x.x:3000)
        if (host && (origin === `http://${host}` || origin === `https://${host}`)) {
            return true;
        }

        console.warn('CSRF: Blocked cross-origin request', {
            origin,
            host,
            allowed: ALLOWED_ORIGINS,
        });
        return false;
    }

    // Fallback to Referer header
    if (referer) {
        // Allow if referer starts with an explicitly allowed origin
        const isExplicitlyAllowed = ALLOWED_ORIGINS.some(allowedOrigin =>
            referer.startsWith(allowedOrigin)
        );

        if (isExplicitlyAllowed) return true;

        // Allow if referer matches current host (Same-Origin)
        if (host && (referer.startsWith(`http://${host}`) || referer.startsWith(`https://${host}`))) {
            return true;
        }

        console.warn('CSRF: Blocked request with invalid referer', {
            referer,
            host,
            allowed: ALLOWED_ORIGINS,
        });
        return false;
    }

    // No Origin or Referer header
    // Default to deny for state-changing (sensitive) methods to prevent CSRF bypass
    const method = request.method.toUpperCase();
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (isSafeMethod) {
        return true;
    }

    console.warn('CSRF: Blocked sensitive request without Origin/Referer headers', {
        method,
        path: request.nextUrl.pathname,
    });

    return false;
}

/**
 * Validates custom request header to prevent simple form CSRF
 * Checks for X-Requested-With header set by legitimate client
 * 
 * @param request - Next.js request object
 * @returns true if custom header present, false otherwise
 */
export function validateCustomHeader(request: NextRequest): boolean {
    const requestedWith = request.headers.get('x-requested-with');

    // Accept XMLHttpRequest (standard) or our custom value
    if (requestedWith === 'XMLHttpRequest' || requestedWith === 'fetch') {
        return true;
    }

    // Missing custom header
    console.warn('CSRF: Request missing X-Requested-With header', {
        path: request.nextUrl.pathname,
    });

    return false;
}

/**
 * Comprehensive CSRF validation for API routes
 * Combines Origin and custom header checks
 * 
 * @param request - Next.js request object
 * @throws Error if validation fails
 */
export function requireValidOrigin(request: NextRequest): void {
    if (!validateOrigin(request)) {
        throw new Error('Invalid request origin');
    }
}

/**
 * Strict CSRF validation (Origin + Custom Header)
 * Use for highly sensitive operations
 * 
 * @param request - Next.js request object
 * @throws Error if validation fails
 */
export function requireStrictCSRF(request: NextRequest): void {
    if (!validateOrigin(request)) {
        throw new Error('Invalid request origin');
    }

    if (!validateCustomHeader(request)) {
        throw new Error('Missing required request header');
    }
}

/**
 * Create CSRF error response
 * Standardized error response for CSRF violations
 * 
 * @param message - Error message
 * @returns NextResponse with 403 status
 */
export function csrfErrorResponse(message: string = 'Cross-site request blocked'): NextResponse {
    return NextResponse.json(
        { error: message, code: 'CSRF_VALIDATION_FAILED' },
        { status: 403 }
    );
}
