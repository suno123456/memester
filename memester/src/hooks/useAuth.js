import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result (Safari fallback)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) await createUserProfile(result.user);
    }).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser({ ...firebaseUser, ...profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function getUserProfile(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : {};
  }

  async function createUserProfile(firebaseUser) {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        score: 0,
        memesCreated: 0,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function loginWithGoogle() {
    try {
      // Try popup first, fallback to redirect (Safari)
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
    } catch (err) {
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, loginWithGoogle, logout };
}
