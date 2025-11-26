// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBWqh2ml4INSiHpBhlN_GImjqsaCQA1YKg",
  authDomain: "waddle-rb-duck.firebaseapp.com",
  projectId: "waddle-rb-duck",
  storageBucket: "waddle-rb-duck.firebasestorage.app",
  messagingSenderId: "781257613224",
  appId: "1:781257613224:web:24893bae0c6827d3e4479d",
};

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY as string;

if (!VAPID_KEY) {
  console.warn("⚠️ VITE_FCM_VAPID_KEY no está definido");
}

const app = initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

export function getFirebaseMessaging() {
  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
}

export async function createPushToken(): Promise<string> {
  if (!("Notification" in window)) {
    throw new Error("Este navegador no soporta Notifications API");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones denegado");
  }

  const registration = await navigator.serviceWorker.ready;

  const messaging = getFirebaseMessaging();

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("No se pudo obtener el token FCM");
  }

  console.log("✅ Token FCM creado:", token);
  return token;
}