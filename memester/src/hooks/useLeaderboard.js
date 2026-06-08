import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export function useLeaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("score", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d, i) => ({
        rank: i + 1,
        uid: d.id,
        ...d.data(),
      }));
      setPlayers(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { players, loading };
}
