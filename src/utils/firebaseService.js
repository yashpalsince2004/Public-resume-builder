import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, set, get, child } from 'firebase/database';
import { auth, db, rtdb, googleProvider } from '../lib/firebase.js';

export async function signUpWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential;
}

export async function signInWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result;
}

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  return result;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase request timeout')), ms));
}

export async function saveProfileToFirestore(uid, profileData) {
  if (!uid || !profileData) {
    return { success: false, error: 'User ID or profile data is missing.' };
  }

  let firestoreSuccess = false;
  let rtdbSuccess = false;
  let lastError = '';

  // 1. Write to Cloud Firestore (with 3s safety timeout)
  try {
    const userDocRef = doc(db, 'users', uid);
    await Promise.race([
      setDoc(
        userDocRef,
        {
          profile: profileData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
      timeoutPromise(3000)
    ]);
    firestoreSuccess = true;
  } catch (err) {
    console.warn('Firestore save warning:', err);
    lastError = err.message || err.toString();
  }

  // 2. Write to Realtime Database (with 3s safety timeout)
  try {
    const userRef = ref(rtdb, 'users/' + uid);
    await Promise.race([
      set(userRef, {
        profile: profileData,
        updatedAt: new Date().toISOString(),
      }),
      timeoutPromise(3000)
    ]);
    rtdbSuccess = true;
  } catch (err) {
    console.warn('Realtime Database save warning:', err);
    if (!lastError) lastError = err.message || err.toString();
  }

  if (firestoreSuccess || rtdbSuccess) {
    return { success: true };
  }

  return { success: false, error: lastError || 'Failed to write profile to Firebase.' };
}

export async function getProfileFromFirestore(uid) {
  if (!uid) return null;

  // 1. Try Cloud Firestore
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists() && docSnap.data().profile) {
      return docSnap.data().profile;
    }
  } catch (err) {
    console.warn('Firestore fetch warning:', err.message);
  }

  // 2. Fallback to Realtime Database
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    if (snapshot.exists() && snapshot.val()?.profile) {
      return snapshot.val().profile;
    }
  } catch (err) {
    console.warn('Realtime Database fetch warning:', err.message);
  }

  return null;
}
