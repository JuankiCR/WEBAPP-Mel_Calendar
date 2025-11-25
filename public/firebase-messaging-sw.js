importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBWqh2ml4INSiHpBhlN_GImjqsaCQA1YKg",
  authDomain: "waddle-rb-duck.firebaseapp.com",
  projectId: "waddle-rb-duck",
  storageBucket: "waddle-rb-duck.firebasestorage.app",
  messagingSenderId: "781257613224",
  appId: "1:781257613224:web:24893bae0c6827d3e4479d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📦 Mensaje recibido en background:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/pwa-192x192.jpeg",
  });
});
