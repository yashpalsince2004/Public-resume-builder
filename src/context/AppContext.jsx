import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthChange, signOutUser, getProfileFromFirestore, saveProfileToFirestore } from '../utils/firebaseService.js';
import { EMPTY_PROFILE } from '../utils/resumeParser.js';

const AppContext = createContext(null);

/** Credit cost configuration (centralized, easily changeable) */
export const CREDIT_COSTS = {
  resume_tailoring: 3,
  cover_letter: 2,
  linkedin_optimization: 10,
  resume_parsing: 0,
  job_scan: 0,
  pdf_download: 0,
  text_rewrite: 1,
};

const DEFAULT_FREE_CREDITS = 10;

export function AppProvider({ children }) {
  // ── Auth ────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Profile (Master Resume) ────────────────────────────
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rb_profile');
        if (stored) return JSON.parse(stored);
      } catch { /* fallback */ }
    }
    return { ...EMPTY_PROFILE };
  });

  // ── Credits ────────────────────────────────────────────
  const [credits, setCredits] = useState(DEFAULT_FREE_CREDITS);
  const [creditHistory, setCreditHistory] = useState([]);

  // ── Applications ───────────────────────────────────────
  const [applications, setApplications] = useState([]);

  // ── Toasts ─────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // ── Sidebar ────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Auth Listener ──────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        try {
          const saved = await getProfileFromFirestore(firebaseUser.uid);
          if (saved) {
            setProfile(saved);
            localStorage.setItem('rb_profile', JSON.stringify(saved));
          }
        } catch (err) {
          console.warn('Failed to load profile from Firebase:', err);
        }

        // Load credits from Firestore (or initialize)
        try {
          const { doc, getDoc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase.js');
          const creditRef = doc(db, 'credit_wallets', firebaseUser.uid);
          const creditSnap = await getDoc(creditRef);
          if (creditSnap.exists()) {
            setCredits(creditSnap.data().balance ?? DEFAULT_FREE_CREDITS);
          } else {
            await setDoc(creditRef, {
              balance: DEFAULT_FREE_CREDITS,
              userId: firebaseUser.uid,
              createdAt: new Date().toISOString(),
            });
            setCredits(DEFAULT_FREE_CREDITS);
          }
        } catch (err) {
          console.warn('Credit wallet init failed:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Profile Management ─────────────────────────────────
  const updateProfile = useCallback(async (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('rb_profile', JSON.stringify(newProfile));
    if (user) {
      try {
        await saveProfileToFirestore(user.uid, newProfile);
      } catch (err) {
        console.warn('Profile save failed:', err);
      }
    }
  }, [user]);

  // ── Credit Operations ──────────────────────────────────
  const deductCredits = useCallback(async (amount, type, referenceId = '') => {
    if (credits < amount) {
      return { success: false, error: 'INSUFFICIENT_CREDITS' };
    }

    const newBalance = credits - amount;
    setCredits(newBalance);

    const transaction = {
      userId: user?.uid || 'anonymous',
      amount: -amount,
      type,
      referenceId,
      balance: newBalance,
      createdAt: new Date().toISOString(),
    };

    setCreditHistory(prev => [transaction, ...prev]);

    // Persist to Firestore
    if (user) {
      try {
        const { doc, updateDoc, addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase.js');
        await updateDoc(doc(db, 'credit_wallets', user.uid), { balance: newBalance });
        await addDoc(collection(db, 'credit_transactions'), transaction);
      } catch (err) {
        console.warn('Credit transaction failed:', err);
      }
    }

    return { success: true, balance: newBalance };
  }, [credits, user]);

  const refundCredits = useCallback(async (amount, type, referenceId = '') => {
    const newBalance = credits + amount;
    setCredits(newBalance);

    const transaction = {
      userId: user?.uid || 'anonymous',
      amount: amount,
      type: `refund_${type}`,
      referenceId,
      balance: newBalance,
      createdAt: new Date().toISOString(),
    };

    setCreditHistory(prev => [transaction, ...prev]);

    if (user) {
      try {
        const { doc, updateDoc, addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase.js');
        await updateDoc(doc(db, 'credit_wallets', user.uid), { balance: newBalance });
        await addDoc(collection(db, 'credit_transactions'), transaction);
      } catch (err) {
        console.warn('Credit refund failed:', err);
      }
    }

    return { success: true, balance: newBalance };
  }, [credits, user]);

  // ── Application Management ─────────────────────────────
  const addApplication = useCallback((app) => {
    const newApp = {
      id: `app_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'saved',
      events: [{ type: 'created', date: new Date().toISOString() }],
      ...app,
    };
    setApplications(prev => [newApp, ...prev]);

    if (user) {
      import('firebase/firestore').then(({ doc, setDoc, collection }) => {
        import('../lib/firebase.js').then(({ db }) => {
          setDoc(doc(db, 'users', user.uid, 'applications', newApp.id), newApp).catch(() => {});
        });
      });
    }
    return newApp;
  }, [user]);

  const updateApplication = useCallback((id, updates) => {
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    ));
  }, []);

  // ── Toast System ───────────────────────────────────────
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Sign Out ───────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
      setUser(null);
      setProfile({ ...EMPTY_PROFILE });
      setCredits(DEFAULT_FREE_CREDITS);
      setApplications([]);
      localStorage.removeItem('rb_profile');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      addToast('Failed to sign out', 'error');
    }
  }, [addToast]);

  const value = {
    // Auth
    user,
    authLoading,
    handleSignOut,

    // Profile
    profile,
    updateProfile,

    // Credits
    credits,
    creditHistory,
    deductCredits,
    refundCredits,
    CREDIT_COSTS,

    // Applications
    applications,
    addApplication,
    updateApplication,

    // Toasts
    toasts,
    addToast,
    removeToast,

    // UI
    sidebarCollapsed,
    setSidebarCollapsed,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
