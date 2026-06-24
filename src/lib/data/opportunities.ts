import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import type { Opportunity } from "@/types";
import { SEED_BY_ID, SEED_OPPORTUNITIES } from "./seed";

/**
 * Fetch all opportunities. Uses Firestore when configured, otherwise the rich
 * seed set (demo mode). Network/permission errors fall back to seed data so the
 * UI always renders.
 */
export async function getOpportunities(max = 200): Promise<Opportunity[]> {
  if (!isFirebaseConfigured || !db) return SEED_OPPORTUNITIES;
  try {
    const q = query(
      collection(db, "opportunities"),
      orderBy("createdAt", "desc"),
      fbLimit(max),
    );
    const snap = await getDocs(q);
    if (snap.empty) return SEED_OPPORTUNITIES;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Opportunity);
  } catch (err) {
    console.warn("[opportunities] falling back to seed data:", err);
    return SEED_OPPORTUNITIES;
  }
}

/** Fetch a single opportunity by id. */
export async function getOpportunityById(
  id: string,
): Promise<Opportunity | null> {
  if (!isFirebaseConfigured || !db) return SEED_BY_ID.get(id) ?? null;
  try {
    const ref = doc(db, "opportunities", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return SEED_BY_ID.get(id) ?? null;
    return { id: snap.id, ...snap.data() } as Opportunity;
  } catch (err) {
    console.warn("[opportunities] falling back to seed for", id, err);
    return SEED_BY_ID.get(id) ?? null;
  }
}

/** Resolve a list of ids to opportunities (used by the Saved page). */
export async function getOpportunitiesByIds(
  ids: string[],
): Promise<Opportunity[]> {
  const all = await getOpportunities();
  const byId = new Map(all.map((o) => [o.id, o]));
  return ids
    .map((id) => byId.get(id))
    .filter((o): o is Opportunity => Boolean(o));
}
