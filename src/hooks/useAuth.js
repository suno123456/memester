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

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) await createProfile(result.user);
      })
      .catch(() => {});

    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setUser({ ...u, ...(snap.exists() ? snap.data() : {}) });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  async function createProfile(u) {
    const ref = doc(db, "users", u.uid);
    if (!(await getDoc(ref)).exists()) {
      await setDoc(ref, {
        uid: u.uid,
        displayName: u.displayName,
        photoURL: u.photoURL,
        bestScore: 0,
        gamesPlayed: 0,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function login() {
    try {
      if (isMobile()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        await createProfile(result.user);
      }
    } catch (e) {
      if (
        e.code === "auth/popup-blocked" ||
        e.code === "auth/popup-closed-by-user" ||
        e.code === "auth/cancelled-popup-request"
      ) {
        await signInWithRedirect(auth, googleProvider);
      }
    }
  }

  return { user, loading, login, logout: () => signOut(auth) };
}
