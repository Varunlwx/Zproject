import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcYrBx4Cajd8P8RxH-i-JNTKXit2j2Oas",
  authDomain: "testapp-e72cc.firebaseapp.com",
  projectId: "testapp-e72cc",
  storageBucket: "testapp-e72cc.firebasestorage.app",
  messagingSenderId: "529620499352",
  appId: "1:529620499352:web:bb9a262f87a97c161d89ed"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
