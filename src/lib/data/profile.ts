import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import type { NotificationPreferences, UserProfile } from "@/types";
import { DEFAULT_NOTIFICATIONS } from "@/lib/constants";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Compute profile completion percentage from filled fields. */
export function computeProfileCompletion(p: Partial<UserProfile>): number {
  const checks = [
    Boolean(p.name),
    Boolean(p.email),
    Boolean(p.country),
    Boolean(p.interests?.length),
    Boolean(p.careerGoals),
    Boolean(p.referralSource),
    Boolean(p.city || p.postalCode),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** Read a user's profile from Firestore. */
export async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/** Create or merge a user's profile document. */
export async function upsertUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  const merged = {
    ...(existing.exists() ? existing.data() : {}),
    ...data,
    uid,
    notifications:
      data.notifications ??
      (existing.exists()
        ? (existing.data().notifications as NotificationPreferences)
        : DEFAULT_NOTIFICATIONS),
    updatedAt: new Date().toISOString(),
    ...(existing.exists() ? {} : { createdAt: new Date().toISOString() }),
  };
  merged.profileCompletion = computeProfileCompletion(merged as UserProfile);
  await setDoc(ref, { ...merged, _ts: serverTimestamp() }, { merge: true });
}

/** Partial update of a user's profile document. */
export async function patchUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}
