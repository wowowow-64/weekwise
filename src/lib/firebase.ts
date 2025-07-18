// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Function to get config from local storage or environment variables
const getFirebaseConfig = (): FirebaseOptions | null => {
  if (typeof window !== 'undefined') {
    const storedConfig = localStorage.getItem('firebaseConfig');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        // Basic validation to ensure it's not empty/malformed
        if (config.apiKey && config.projectId) {
          return config;
        }
      } catch (e) {
        console.error("Could not parse firebaseConfig from localStorage", e);
      }
    }
  }

  // Fallback to environment variables if not in browser or not in localStorage
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

let app, auth, firestore;

const firebaseConfig = getFirebaseConfig();

if (firebaseConfig) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  firestore = getFirestore(app);
} else {
  console.warn("Firebase config is not available. Please set it up on the /setup page or in your environment variables.");
  // Provide mock objects or handle the uninitialized case gracefully
  auth = {} as any; // Avoids crashing the app if firebase isn't configured
  firestore = {} as any;
}


export { app, auth, firestore };