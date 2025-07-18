// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { decrypt } from './crypto';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

const getFirebaseConfig = (): FirebaseOptions | null => {
  // This function now ONLY runs on the client.
  const storedConfig = localStorage.getItem('firebaseConfig');
  if (storedConfig) {
    try {
      // Decrypt the config before parsing
      const decryptedConfig = decrypt(storedConfig);
      const config = JSON.parse(decryptedConfig);
      if (config.apiKey && config.projectId) {
        return config;
      }
    } catch (e) {
      console.error("Could not parse firebaseConfig from localStorage", e);
    }
  }
  return null;
}

const initializeFirebase = () => {
  if (typeof window === 'undefined' || getApps().length > 0) {
    // Already initialized or on the server.
    // If already initialized, we can grab the instances.
    if(getApps().length > 0) {
        app = getApp();
        auth = getAuth(app);
        firestore = getFirestore(app);
    }
    return;
  }

  const firebaseConfig = getFirebaseConfig();

  if (firebaseConfig) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  } else {
    console.warn("Firebase config is not available. Please set it up on the /setup page.");
  }
};

// We export the initialization function and the service variables.
// The variables will be undefined until initializeFirebase is called.
export { app, auth, firestore, initializeFirebase };
