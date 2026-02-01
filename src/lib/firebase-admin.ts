/**
 * Firebase Admin SDK - Server-side only
 * Used for Custom Claims, token verification, and privileged operations
 * 
 * SECURITY: This file should ONLY be imported in API routes, never in client code
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let adminAuth: Auth;
let adminDb: Firestore;

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Parse service account from environment variable
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
        // Fallback: use individual environment variables for Vercel/hosting
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
            return initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }

        throw new Error(
            'Firebase Admin SDK not configured. Set FIREBASE_SERVICE_ACCOUNT or individual vars.'
        );
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT: ${error}`);
    }
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth(): Auth {
    if (!adminAuth) {
        app = getFirebaseAdminApp();
        adminAuth = getAuth(app);
    }
    return adminAuth;
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getAdminDb(): Firestore {
    if (!adminDb) {
        app = getFirebaseAdminApp();
        adminDb = getFirestore(app);
    }
    return adminDb;
}

/**
 * Verify Firebase ID token and return decoded claims
 */
export async function verifyIdToken(token: string) {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token);
}

/**
 * Set admin custom claim for a user
 * @param uid - Firebase user UID
 * @param isAdmin - Whether user should have admin access
 */
export async function setAdminClaim(uid: string, isAdmin: boolean = true) {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
    return { success: true, uid, isAdmin };
}

/**
 * Check if a user has admin custom claim
 * @param uid - Firebase user UID
 */
export async function checkAdminClaim(uid: string): Promise<boolean> {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    return user.customClaims?.admin === true;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
    const auth = getAdminAuth();
    return auth.getUserByEmail(email);
}
