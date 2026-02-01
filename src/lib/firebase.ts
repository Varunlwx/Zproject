import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Check for missing env vars in development
if (process.env.NODE_ENV === 'development') {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing Firebase environment variables: ${missing.join(', ')}`);
    console.warn('Copy .env.example to .env.local and fill in the values.');
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate critical config values
if (typeof window !== 'undefined') {
  const criticalVars = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = criticalVars.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  if (missing.length > 0) {
    console.error('❌ Firebase configuration incomplete. Missing:', missing);
    console.error('Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.');
  }
}

// Initialize Firebase only if not already initialized
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error('Firebase initialization failed. Please check your configuration.');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
// Firebase Messaging - safely initialized with error handling
// Messaging requires service worker and may not be supported in all environments
let messagingInstance: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  try {
    messagingInstance = getMessaging(app);
  } catch (error) {
    // Messaging not supported or not configured - this is okay
    console.log('Firebase Messaging not available:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export const messaging = messagingInstance;

/**
 * Test Firebase connectivity (for debugging network issues)
 * Call this in browser console to diagnose auth/network-request-failed errors
 */
export async function testFirebaseConnectivity(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (typeof window === 'undefined') {
    return { success: false, errors: ['This function can only run in the browser'] };
  }

  // Test 1: Check if Firebase config is valid
  const criticalVars = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = criticalVars.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  if (missing.length > 0) {
    errors.push(`Missing Firebase config: ${missing.join(', ')}`);
  }

  // Test 2: Try to reach Firebase Auth endpoint
  try {
    const authDomain = firebaseConfig.authDomain;
    if (!authDomain) {
      errors.push('authDomain is not configured');
    } else {
      const testUrl = `https://${authDomain}`;
      const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      // Note: no-cors mode means we can't read response, but if it doesn't throw, connection works
    }
  } catch (error) {
    errors.push(`Cannot reach Firebase Auth domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 3: Check if auth is initialized
  if (!auth) {
    errors.push('Firebase Auth is not initialized');
  }

  return {
    success: errors.length === 0,
    errors
  };
}

export default app;
