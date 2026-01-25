import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db, auth } from './firebase';
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission() {
    if (!messaging) return;

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            await saveToken();
        } else {
            console.log('Unable to get permission to notify.');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

export async function saveToken() {
    if (!messaging || !auth.currentUser) return;

    try {
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (currentToken) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, {
                fcmTokens: arrayUnion(currentToken),
                lastUpdated: serverTimestamp(),
            }, { merge: true });
            console.log('Web FCM Token saved to Firestore');
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
    }
}

export function onMessageListener() {
    if (!messaging) return;

    return new Promise((resolve) => {
        onMessage(messaging!, (payload) => {
            console.log('Foreground message received:', payload);
            resolve(payload);
        });
    });
}
