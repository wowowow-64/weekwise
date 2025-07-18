
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { decrypt } from './crypto';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

const getFirebaseConfig = (): FirebaseOptions | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const storedConfig = localStorage.getItem('firebaseConfig');
  if (storedConfig) {
    try {
      const decryptedConfig = decrypt(storedConfig);
      if (!decryptedConfig) {
        throw new Error("Decrypted config is empty.");
      }
      const config = JSON.parse(decryptedConfig);
      if (config.apiKey && config.projectId) {
        return config;
      }
    } catch (e) {
      console.error("Could not parse firebaseConfig from localStorage.", e);
      localStorage.removeItem('firebaseConfig');
    }
  }
  return null;
}

const initializeFirebase = () => {
  const firebaseConfig = getFirebaseConfig();

  if (!app && firebaseConfig) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);
      enableIndexedDbPersistence(firestore)
        .catch((err) => {
          if (err.code == 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open.');
          } else if (err.code == 'unimplemented') {
            console.warn('Firestore persistence not available in this browser.');
          }
        });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      // Reset instances on failure
      app = null;
      auth = null;
      firestore = null;
      throw error; // Re-throw to be caught by AuthProvider
    }
  } else if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
  }
};

const getFirebaseAuth = (): Auth => {
    if (!auth) {
        throw new Error("Auth is not initialized. Make sure Firebase is configured correctly.");
    }
    return auth;
};

const getFirebaseFirestore = (): Firestore => {
    if (!firestore) {
        throw new Error("Firestore is not initialized. Make sure Firebase is configured correctly.");
    }
    return firestore;
};

initializeFirebase();

export { initializeFirebase, getFirebaseAuth, getFirebaseFirestore };
