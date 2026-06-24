"use client";

import * as React from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as fbUpdateProfile,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  getUserProfile,
  isAdminEmail,
  upsertUserProfile,
} from "@/lib/data/profile";
import { createDemoUser } from "@/lib/data/demo-user";
import { DEFAULT_NOTIFICATIONS } from "@/lib/constants";
import { deriveLocationFromZip, regionForCountry } from "@/lib/geo";
import type { UserProfile } from "@/types";
import type { OnboardingData } from "@/stores/onboarding-store";
import { EVENTS, identify, resetAnalytics, track } from "@/lib/analytics";

const DEMO_KEY = "prospect-demo-profile";

interface AuthContextValue {
  user: { uid: string; email: string | null } | null;
  profile: UserProfile | null;
  loading: boolean;
  demoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  completeOnboarding: (
    data: OnboardingData,
    account: { name: string; email: string },
  ) => Promise<void>;
  updateUserProfile: (patch: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function readDemoProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function writeDemoProfile(p: UserProfile | null) {
  if (typeof window === "undefined") return;
  if (p) window.localStorage.setItem(DEMO_KEY, JSON.stringify(p));
  else window.localStorage.removeItem(DEMO_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const demoMode = !isFirebaseConfigured;
  const [user, setUser] = React.useState<AuthContextValue["user"]>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  // ---- Bootstrap session -------------------------------------------------
  React.useEffect(() => {
    if (demoMode) {
      const existing = readDemoProfile();
      if (existing) {
        setProfile(existing);
        setUser({ uid: existing.uid, email: existing.email });
      }
      setLoading(false);
      return;
    }
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, email: fbUser.email });
        const p = await getUserProfile(fbUser.uid);
        if (p) {
          p.isAdmin = p.isAdmin || isAdminEmail(p.email);
          setProfile(p);
          identify(fbUser.uid, { email: fbUser.email });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [demoMode]);

  // ---- Demo helpers ------------------------------------------------------
  const setDemo = React.useCallback((p: UserProfile) => {
    writeDemoProfile(p);
    setProfile(p);
    setUser({ uid: p.uid, email: p.email });
  }, []);

  // ---- Auth actions ------------------------------------------------------
  const signInWithGoogle = React.useCallback(async () => {
    if (demoMode || !auth) {
      const p =
        readDemoProfile() ??
        createDemoUser({ name: "Demo Explorer", email: "demo@prospect.app" });
      setDemo(p);
      track(EVENTS.logIn, { method: "google", demo: true });
      return;
    }
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const u = cred.user;
    let p = await getUserProfile(u.uid);
    if (!p) {
      p = {
        uid: u.uid,
        name: u.displayName ?? "",
        email: u.email ?? "",
        photoURL: u.photoURL,
        country: "",
        interests: [],
        careerGoals: "",
        referralSource: "",
        notifications: { ...DEFAULT_NOTIFICATIONS },
        profileCompletion: 0,
        onboarded: false,
        isAdmin: isAdminEmail(u.email),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await upsertUserProfile(u.uid, p);
    }
    setProfile(p);
    track(EVENTS.logIn, { method: "google" });
  }, [demoMode, setDemo]);

  const signInWithEmail = React.useCallback(
    async (email: string, password: string) => {
      if (demoMode || !auth) {
        const p =
          readDemoProfile() ?? createDemoUser({ email });
        setDemo({ ...p, email });
        track(EVENTS.logIn, { method: "email", demo: true });
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      track(EVENTS.logIn, { method: "email" });
    },
    [demoMode, setDemo],
  );

  const signUpWithEmail = React.useCallback(
    async (name: string, email: string, password: string) => {
      if (demoMode || !auth) {
        const p = createDemoUser({
          name,
          email,
          onboarded: false,
          profileCompletion: 20,
          interests: [],
          careerGoals: "",
          isAdmin: isAdminEmail(email),
        });
        setDemo(p);
        track(EVENTS.signUp, { method: "email", demo: true });
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await fbUpdateProfile(cred.user, { displayName: name });
      const p: UserProfile = {
        uid: cred.user.uid,
        name,
        email,
        photoURL: null,
        country: "",
        interests: [],
        careerGoals: "",
        referralSource: "",
        notifications: { ...DEFAULT_NOTIFICATIONS },
        profileCompletion: 20,
        onboarded: false,
        isAdmin: isAdminEmail(email),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await upsertUserProfile(cred.user.uid, p);
      setProfile(p);
      track(EVENTS.signUp, { method: "email" });
    },
    [demoMode, setDemo],
  );

  const sendReset = React.useCallback(
    async (email: string) => {
      if (demoMode || !auth) return; // simulated
      await sendPasswordResetEmail(auth, email);
    },
    [demoMode],
  );

  const completeOnboarding = React.useCallback(
    async (data: OnboardingData, account: { name: string; email: string }) => {
      const derived = deriveLocationFromZip(data.country, data.postalCode);
      const base: UserProfile = {
        ...(profile ??
          createDemoUser({ name: account.name, email: account.email })),
        name: account.name || profile?.name || "Explorer",
        email: account.email || profile?.email || "explorer@prospect.app",
        referralSource: data.referralSource,
        interests: data.interests,
        careerGoals: data.careerGoals,
        country: data.country,
        postalCode: data.postalCode,
        region: regionForCountry(data.country),
        ...(derived.state ? { state: derived.state } : {}),
        ...(derived.city ? { city: derived.city } : {}),
        onboarded: true,
        updatedAt: new Date().toISOString(),
      };
      base.isAdmin = base.isAdmin || isAdminEmail(base.email);

      if (demoMode || !auth || !user) {
        base.uid = user?.uid ?? base.uid ?? "demo-user";
        base.profileCompletion = 100;
        setDemo(base);
      } else {
        base.uid = user.uid;
        await upsertUserProfile(user.uid, base);
        setProfile(base);
      }
      track(EVENTS.onboardingComplete, {
        interests: data.interests.length,
        country: data.country,
      });
    },
    [demoMode, profile, user, setDemo],
  );

  const updateUserProfile = React.useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!profile) return;
      const next = {
        ...profile,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      if (demoMode || !auth || !user) {
        setDemo(next);
      } else {
        await upsertUserProfile(user.uid, next);
        setProfile(next);
      }
    },
    [demoMode, profile, user, setDemo],
  );

  const logout = React.useCallback(async () => {
    resetAnalytics();
    if (demoMode || !auth) {
      writeDemoProfile(null);
      setProfile(null);
      setUser(null);
      return;
    }
    await signOut(auth);
  }, [demoMode]);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    demoMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendReset,
    completeOnboarding,
    updateUserProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
