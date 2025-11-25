/// <reference lib="webworker" />

// 📦 Precarga recursos estáticos (Workbox)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
} else {
  console.error('❌ Workbox no se cargó correctamente');
}

// 🔥 Firebase para push
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 🚀 Inicializa Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBWqh2ml4INSiHpBhlN_GImjqsaCQA1YKg",
  authDomain: "waddle-rb-duck.firebaseapp.com",
  projectId: "waddle-rb-duck",
  storageBucket: "waddle-rb-duck.firebasestorage.app",
  messagingSenderId: "781257613224",
  appId: "1:781257613224:web:24893bae0c6827d3e4479d",
});

// 📬 Notificaciones push en segundo plano
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📦 Mensaje recibido en background:", payload);

  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Notificación', {
    body: body || '',
    icon: '/pwa-192x192.jpeg',
    tag: 'waddle-general',
    renotify: true
  });
});
