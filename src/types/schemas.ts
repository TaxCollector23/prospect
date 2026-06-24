import { z } from "zod";

export const opportunityTypeSchema = z.enum([
  "scholarship",
  "internship",
  "research",
  "fellowship",
  "grant",
  "competition",
  "hackathon",
  "summer-program",
  "accelerator",
  "volunteer",
  "conference",
  "career-program",
  "educational",
  "community",
]);

export const notificationPreferencesSchema = z.object({
  emailAlerts: z.boolean(),
  weeklyDigest: z.boolean(),
  newOpportunities: z.boolean(),
  deadlineReminders: z.boolean(),
  applicationReminders: z.boolean(),
});

/* ---------------- Auth ---------------- */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/* ---------------- Onboarding ---------------- */

export const onboardingSchema = z.object({
  referralSource: z.string().min(1, "Pick one option"),
  interests: z.array(z.string()).min(1, "Choose at least one interest"),
  careerGoals: z.string().min(2, "Tell us what you want to become"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional().default(""),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/* ---------------- Profile / Settings ---------------- */

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  country: z.string().min(1).optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  interests: z.array(z.string()).optional(),
  careerGoals: z.string().optional(),
  notifications: notificationPreferencesSchema.partial().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/* ---------------- Opportunity (admin / ingestion) ---------------- */

export const opportunityInputSchema = z.object({
  title: z.string().min(3, "Title is required"),
  organization: z.string().min(2, "Organization is required"),
  organizationLogo: z.string().url().nullish(),
  description: z.string().min(10, "Add a fuller description"),
  shortDescription: z.string().min(10, "Add a short description").max(220),
  requirements: z.array(z.string()).optional().default([]),
  eligibility: z.array(z.string()).optional().default([]),
  opportunityType: opportunityTypeSchema,
  location: z.string().min(1, "Location is required"),
  remote: z.boolean().default(false),
  country: z.string().min(1, "Country is required"),
  region: z.string().optional(),
  tags: z.array(z.string()).default([]),
  deadline: z.string().nullish(),
  applicationUrl: z.string().url("Enter a valid application URL"),
  websiteUrl: z.string().url().nullish(),
  discordServerName: z.string().nullish(),
  discordServerUrl: z.string().url().nullish(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  amount: z.string().nullish(),
});

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;

/** Ingestion payload — single or batch. */
export const ingestionSchema = z.object({
  source: z.string().default("api"),
  opportunities: z.array(opportunityInputSchema).min(1),
});

export type IngestionInput = z.infer<typeof ingestionSchema>;

/* ---------------- Activity ---------------- */

export const activitySchema = z.object({
  opportunityId: z.string().min(1),
  actionType: z.enum(["view", "save", "unsave", "apply_click", "share"]),
});

export type ActivityInput = z.infer<typeof activitySchema>;
