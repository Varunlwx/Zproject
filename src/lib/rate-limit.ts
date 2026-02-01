import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiting Utilities using Upstash Redis
 * 
 * Protects API endpoints from:
 * - DoS attacks
 * - Brute-force attempts
 * - Webhook flooding
 * - Resource exhaustion
 * 
 * Setup required:
 * 1. Create Upstash Redis database at https://upstash.com
 * 2. Add environment variables:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 * 3. Install: npm install @upstash/redis @upstash/ratelimit
 */

// Initialize Redis client
// Falls back gracefully if Upstash not configured (dev environment)
let redis: Redis | null = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } else {
        console.warn('Upstash Redis not configured. Rate limiting disabled.');
    }
} catch (error) {
    console.error('Failed to initialize Upstash Redis:', error);
}

// Rate limiters for different tiers

/**
 * Tier 1: Critical endpoints (payment APIs)
 * Limit: 10 requests per minute per user/IP
 * Use for: create-order, verify
 */
export const criticalLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'rate_limit:critical',
    })
    : null;

/**
 * Tier 2: High sensitivity (shipping creation)
 * Limit: 30 requests per minute per user
 * Use for: create-shipment
 */
export const highLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: 'rate_limit:high',
    })
    : null;

/**
 * Tier 3: Medium (queries, tracking)
 * Limit: 60 requests per minute per user
 * Use for: rates, track
 */
export const mediumLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
        prefix: 'rate_limit:medium',
    })
    : null;

/**
 * Tier 4: Webhook protection
 * Limit: 100 requests per minute per IP
 * Use for: webhook endpoint
 */
export const webhookLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'rate_limit:webhook',
    })
    : null;

/**
 * Get identifier for rate limiting
 * Prefers user ID if authenticated, falls back to IP address
 * 
 * @param request - Next.js request object
 * @param userId - Optional authenticated user ID
 * @returns Rate limit identifier string
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
    if (userId) {
        return `user:${userId}`;
    }

    // Get IP from various headers (Vercel, Cloudflare, generic proxies)
    const ip =
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('cf-connecting-ip') ||
        'anonymous';

    return `ip:${ip}`;
}

/**
 * Apply rate limit and return error response if exceeded
 * Adds standard rate limit headers to response
 * 
 * @param limiter - Ratelimit instance to use
 * @param identifier - Unique identifier for this request
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export async function rateLimit(
    limiter: Ratelimit | null,
    identifier: string
): Promise<NextResponse | null> {
    // If rate limiting not configured, allow request
    if (!limiter) {
        return null;
    }

    try {
        const { success, limit, reset, remaining } = await limiter.limit(identifier);

        if (!success) {
            const resetDate = new Date(reset);
            const retryAfter = Math.ceil((reset - Date.now()) / 1000);

            console.warn('Rate limit exceeded:', {
                identifier,
                limit,
                remaining: 0,
                reset: resetDate.toISOString(),
                retryAfter,
            });

            return NextResponse.json(
                {
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
                    limit,
                    remaining: 0,
                    reset: resetDate.toISOString(),
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': reset.toString(),
                        'Retry-After': retryAfter.toString(),
                    },
                }
            );
        }

        // Request allowed - log remaining quota for monitoring
        console.log('Rate limit check passed:', {
            identifier,
            remaining,
            limit,
        });

        return null; // No error, continue processing
    } catch (error) {
        // If rate limiting fails, log error but allow request
        // Don't block legitimate users due to Redis issues
        console.error('Rate limit check failed:', error);
        return null;
    }
}

/**
 * Convenience wrapper for applying rate limits in API routes
 * 
 * Usage:
 * ```typescript
 * const user = await requireAuth(request);
 * const rateLimitResponse = await withRateLimit(request, criticalLimiter, user.uid);
 * if (rateLimitResponse) return rateLimitResponse;
 * ```
 * 
 * @param request - Next.js request object
 * @param limiter - Ratelimit instance to use
 * @param userId - Optional authenticated user ID
 * @returns NextResponse with 429 if rate limited, null otherwise
 */
export async function withRateLimit(
    request: NextRequest,
    limiter: Ratelimit | null,
    userId?: string
): Promise<NextResponse | null> {
    const identifier = getRateLimitIdentifier(request, userId);
    return rateLimit(limiter, identifier);
}
