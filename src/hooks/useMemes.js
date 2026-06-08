import { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs, onSnapshot,
  doc, updateDoc, increment, query, orderBy,
  limit, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useMemes() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener — מתעדכן אוטומטית כשיש מימם חדש
    const q = query(
      collection(db, "memes"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }));
      setMemes(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function publishMeme({ topText, bottomText, bgUrl, authorName, authorPhoto, authorUid }) {
    const docRef = await addDoc(collection(db, "memes"), {
      topText,
      bottomText,
      bgUrl,
      authorName,
      authorPhoto,
      authorUid,
      likes: 0,
      fire: 0,
      comments: 0,
      viral: false,
      createdAt: serverTimestamp(),
    });

    // Update user score + meme count
    await updateDoc(doc(db, "users", authorUid), {
      memesCreated: increment(1),
      score: increment(100),
    });

    return docRef.id;
  }

  async function likeMeme(memeId) {
    await updateDoc(doc(db, "memes", memeId), {
      likes: increment(1),
    });
  }

  async function fireMeme(memeId, authorUid) {
    await updateDoc(doc(db, "memes", memeId), {
      fire: increment(1),
    });
    // Give author 10 points per fire
    if (authorUid) {
      await updateDoc(doc(db, "users", authorUid), {
        score: increment(10),
      });
    }
  }

  return { memes, loading, publishMeme, likeMeme, fireMeme };
}
