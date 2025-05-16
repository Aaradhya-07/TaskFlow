import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD10BubQluNzL6rvsPna9rVVX2gshTzZMI",
  authDomain: "tbp-test-ccf24.firebaseapp.com",
  projectId: "tbp-test-ccf24",
  storageBucket: "tbp-test-ccf24.firebasestorage.app",
  messagingSenderId: "12997638921",
  appId: "1:12997638921:web:431b6b585e123b265071d8",
  measurementId: "G-TRTXN2XXJ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;