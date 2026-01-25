// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyCcYrBx4Cajd8P8RxH-i-JNTKXit2j2Oas",
    authDomain: "testapp-e72cc.firebaseapp.com",
    projectId: "testapp-e72cc",
    storageBucket: "testapp-e72cc.firebasestorage.app",
    messagingSenderId: "529620499352",
    appId: "1:529620499352:web:bb9a262f87a97c161d89ed"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
