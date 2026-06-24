export type OpportunityType =
  | "scholarship"
  | "internship"
  | "research"
  | "fellowship"
  | "grant"
  | "competition"
  | "hackathon"
  | "summer-program"
  | "accelerator"
  | "volunteer"
  | "conference"
  | "career-program"
  | "educational"
  | "community";

export interface NotificationPreferences {
  emailAlerts: boolean;
  weeklyDigest: boolean;
  newOpportunities: boolean;
  deadlineReminders: boolean;
  applicationReminders: boolean;
}

/** A Prospect user profile (Firestore: `users/{uid}`). */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  country: string;
  postalCode?: string;
  city?: string;
  state?: string;
  region?: string;
  interests: string[];
  careerGoals: string;
  referralSource: string;
  notifications: NotificationPreferences;
  profileCompletion: number;
  onboarded: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** An opportunity (Firestore: `opportunities/{id}`). */
export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  organizationLogo?: string | null;
  description: string;
  shortDescription: string;
  requirements?: string[];
  eligibility?: string[];
  opportunityType: OpportunityType;
  location: string;
  remote: boolean;
  country: string;
  region?: string;
  tags: string[];
  deadline?: string | null;
  applicationUrl: string;
  websiteUrl?: string | null;
  discordServerName?: string | null;
  discordServerUrl?: string | null;
  verified: boolean;
  featured?: boolean;
  qualityScore: number;
  popularity?: number;
  amount?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A saved opportunity (Firestore: `saved_opportunities/{id}`). */
export interface SavedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  savedAt: string;
}

export type ActivityAction = "view" | "save" | "unsave" | "apply_click" | "share";

/** A user activity event (Firestore: `user_activity/{id}`). */
export interface UserActivity {
  id: string;
  userId: string;
  opportunityId: string;
  actionType: ActivityAction;
  timestamp: string;
}

/** An opportunity decorated with a personalized match score. */
export interface ScoredOpportunity extends Opportunity {
  matchScore: number;
  matchReasons: string[];
}

export interface MatchBreakdown {
  interest: number;
  career: number;
  location: number;
  behavior: number;
  freshness: number;
  quality: number;
  popularity: number;
}
