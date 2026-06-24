"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { track, EVENTS } from "@/lib/analytics";

interface SavedState {
  ids: string[];
  hydratedUid: string | null;
  isSaved: (id: string) => boolean;
  toggle: (id: string, uid: string | null) => Promise<void>;
  hydrate: (uid: string | null) => Promise<void>;
  clear: () => void;
}

/**
 * Saved opportunities. Persisted to localStorage for instant UX and demo mode,
 * and synced to Firestore (`saved_opportunities`) when configured + signed in.
 */
export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydratedUid: null,

      isSaved: (id) => get().ids.includes(id),

      toggle: async (id, uid) => {
        const saved = get().ids.includes(id);
        // Optimistic update
        set({
          ids: saved
            ? get().ids.filter((x) => x !== id)
            : [id, ...get().ids],
        });
        track(saved ? EVENTS.opportunityUnsave : EVENTS.opportunitySave, {
          opportunityId: id,
        });

        if (!isFirebaseConfigured || !db || !uid) return;
        const database = db;
        try {
          const col = collection(database, "saved_opportunities");
          if (saved) {
            const q = query(
              col,
              where("userId", "==", uid),
              where("opportunityId", "==", id),
            );
            const snap = await getDocs(q);
            await Promise.all(
              snap.docs.map((d) =>
                deleteDoc(doc(database, "saved_opportunities", d.id)),
              ),
            );
          } else {
            await addDoc(col, {
              userId: uid,
              opportunityId: id,
              savedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn("[saved] sync failed:", err);
        }
      },

      hydrate: async (uid) => {
        if (!isFirebaseConfigured || !db || !uid) {
          set({ hydratedUid: uid });
          return;
        }
        try {
          const q = query(
            collection(db, "saved_opportunities"),
            where("userId", "==", uid),
          );
          const snap = await getDocs(q);
          const remote = snap.docs.map((d) => d.data().opportunityId as string);
          // Union local + remote so nothing is lost.
          const merged = Array.from(new Set([...remote, ...get().ids]));
          set({ ids: merged, hydratedUid: uid });
        } catch (err) {
          console.warn("[saved] hydrate failed:", err);
          set({ hydratedUid: uid });
        }
      },

      clear: () => set({ ids: [], hydratedUid: null }),
    }),
    { name: "prospect-saved" },
  ),
);
