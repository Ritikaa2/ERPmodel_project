import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForMiniERPTesting2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mini-erp-portal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mini-erp-portal',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mini-erp-portal.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo123456789',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      email: user.email || '',
      idToken,
      uid: user.uid,
      photoURL: user.photoURL,
    };
  } catch (error: any) {
    console.warn('Firebase Google Sign-In notice:', error.message);
    throw error;
  }
};
