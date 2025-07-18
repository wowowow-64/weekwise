// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { decrypt } from './crypto';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

const getFirebaseConfig = (): FirebaseOptions | null => {
  // This function now ONLY runs on the client.
  if (typeof window === 'undefined') {
    return null;
  }
  
  const storedConfig = localStorage.getItem('firebaseConfig');
  if (storedConfig) {
    try {
      // Decrypt the config before parsing
      const decryptedConfig = decrypt(storedConfig);
      // If decryption fails, it returns an empty string, which will cause JSON.parse to fail.
      // This is caught below.
      if (!decryptedConfig) {
        throw new Error("Decrypted config is empty.");
      }
      const config = JSON.parse(decryptedConfig);
      if (config.apiKey && config.projectId) {
        return config;
      }
    } catch (e) {
      console.error("Could not parse firebaseConfig from localStorage. It might be malformed or from an old version.", e);
      // If there's an error (e.g., malformed data), clear it.
      localStorage.removeItem('firebaseConfig');
    }
  }
  return null;
}

const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  const firebaseConfig = getFirebaseConfig();

  if (getApps().length === 0) {
    if (firebaseConfig) {
      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        firestore = getFirestore(app);
        enableIndexedDbPersistence(firestore)
          .catch((err) => {
            if (err.code == 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a time.
              console.warn('Firestore persistence failed: Multiple tabs open.');
            } else if (err.code == 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
              console.warn('Firestore persistence not available in this browser.');
            }
          });
      } catch (error) {
        console.error("Firebase initialization failed:", error);
      }
    } else {
      console.warn("Firebase config is not available. Please set it up on the /setup page.");
    }
  } else {
    // If already initialized, we can grab the instances.
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
  }
};

// We export the initialization function and the service variables.
// The variables will be undefined until initializeFirebase is called.
export { app, auth, firestore, initializeFirebase };