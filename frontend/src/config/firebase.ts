import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDrLx_a_pAuH8FAJvGkON2KA029ubx7Bbo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'crmproject-4aab7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'crmproject-4aab7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'crmproject-4aab7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '6361453747742',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:636145374774:web:652bbae06a83519072ea97',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom parameters to always force Google Account selection
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface FirebaseGoogleUser {
  name: string;
  email: string;
  idToken: string;
  uid: string;
  photoURL: string | null;
}

export const signInWithGoogleFirebase = async (): Promise<FirebaseGoogleUser> => {
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
    console.warn('Firebase Google Sign-In Error:', error.code, error.message);

    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In popup was closed before completing authentication.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Google Sign-In popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Google Sign-In request was cancelled.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in your Firebase Console. Please add localhost / your domain to Firebase Authorized Domains.');
    } else if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
      throw new Error('Firebase API key is invalid or placeholder. Please update VITE_FIREBASE_API_KEY in your .env file.');
    }

    throw new Error(error.message || 'Failed to authenticate with Google. Please try again.');
  }
};

