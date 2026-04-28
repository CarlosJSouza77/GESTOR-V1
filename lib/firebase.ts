import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase only if it hasn't been initialized
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore only once
let db: Firestore;
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

try {
  // Try to get existing instance
  db = getFirestore(app, databaseId);
} catch (e) {
  // If no instance exists, initialize with specific settings
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, databaseId);
}

export { db };
export const auth = getAuth(app);
