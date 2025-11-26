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
const firebaseConfig = {
  apiKey: "AIzaSyAXYT0eZzDM28jML3a0s0y-G-3Sz0Bqwl8",
  authDomain: "mel-calendar.firebaseapp.com",
  projectId: "mel-calendar",
  storageBucket: "mel-calendar.firebasestorage.app",
  messagingSenderId: "563668047822",
  appId: "1:563668047822:web:2aa8b2287272f875c27d9f",
  measurementId: "G-Z1GE2GHC07"
};

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
