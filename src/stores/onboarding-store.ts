"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingData {
  referralSource: string;
  interests: string[];
  careerGoals: string;
  country: string;
  postalCode: string;
}

interface OnboardingState extends OnboardingData {
  step: number;
  setField: <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) => void;
  toggleInterest: (interest: string) => void;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

const TOTAL_STEPS = 5;

const initial: OnboardingData = {
  referralSource: "",
  interests: [],
  careerGoals: "",
  country: "",
  postalCode: "",
};

/** Onboarding answers, autosaved to localStorage so progress is never lost. */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initial,
      step: 1,

      setField: (key, value) => set({ [key]: value } as Partial<OnboardingState>),

      toggleInterest: (interest) => {
        const has = get().interests.includes(interest);
        set({
          interests: has
            ? get().interests.filter((i) => i !== interest)
            : [...get().interests, interest],
        });
      },

      setStep: (step) => set({ step: Math.min(TOTAL_STEPS, Math.max(1, step)) }),
      next: () => set({ step: Math.min(TOTAL_STEPS, get().step + 1) }),
      back: () => set({ step: Math.max(1, get().step - 1) }),

      reset: () => set({ ...initial, step: 1 }),
    }),
    { name: "prospect-onboarding" },
  ),
);

export { TOTAL_STEPS };
