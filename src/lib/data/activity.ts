import { addDoc, collection } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import type { ActivityAction, UserActivity } from "@/types";

const LOCAL_KEY = "prospect-activity";
const LOCAL_LIMIT = 100;

/**
 * Record a user activity event. Always stored locally (used by the behavior
 * signal in the recommender) and additionally persisted to Firestore when
 * configured and signed in.
 */
export async function logActivity(
  uid: string | null,
  opportunityId: string,
  actionType: ActivityAction,
): Promise<void> {
  // Local log (drives behavior-based recommendations even in demo mode).
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(LOCAL_KEY);
      const list: UserActivity[] = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: crypto.randomUUID(),
        userId: uid ?? "demo-user",
        opportunityId,
        actionType,
        timestamp: new Date().toISOString(),
      });
      window.localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify(list.slice(0, LOCAL_LIMIT)),
      );
    } catch {
      /* ignore quota errors */
    }
  }

  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    await addDoc(collection(db, "user_activity"), {
      userId: uid,
      opportunityId,
      actionType,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[activity] persist failed:", err);
  }
}

/** Read the local activity log (for client-side recommendation signals). */
export function getLocalActivity(): UserActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as UserActivity[]) : [];
  } catch {
    return [];
  }
}
