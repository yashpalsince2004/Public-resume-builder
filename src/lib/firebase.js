import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

function getEnvVar(key) {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
  }
  return '';
}

const firebaseConfig = {
  apiKey: getEnvVar('PUBLIC_FIREBASE_API_KEY') || getEnvVar('FIREBASE_API_KEY') || 'AIzaSyBgFunrjCnhjqyNrBqjWrvxdcjXf6hxGow',
  authDomain: getEnvVar('PUBLIC_FIREBASE_AUTH_DOMAIN') || getEnvVar('FIREBASE_AUTH_DOMAIN') || 'resume-builder-466b0.firebaseapp.com',
  projectId: getEnvVar('PUBLIC_FIREBASE_PROJECT_ID') || getEnvVar('FIREBASE_PROJECT_ID') || 'resume-builder-466b0',
  storageBucket: getEnvVar('PUBLIC_FIREBASE_STORAGE_BUCKET') || getEnvVar('FIREBASE_STORAGE_BUCKET') || 'resume-builder-466b0.firebasestorage.app',
  messagingSenderId: getEnvVar('PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || getEnvVar('FIREBASE_MESSAGING_SENDER_ID') || '1029522978816',
  appId: getEnvVar('PUBLIC_FIREBASE_APP_ID') || getEnvVar('FIREBASE_APP_ID') || '1:1029522978816:web:2cae73b632c29319e880e5',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, rtdb, googleProvider };
