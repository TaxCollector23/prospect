import type { UserProfile } from "@/types";
import { DEFAULT_NOTIFICATIONS } from "@/lib/constants";

/** A pre-filled demo profile used when Firebase auth isn't configured. */
export function createDemoUser(
  overrides: Partial<UserProfile> = {},
): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: "demo-user",
    name: "Alex Rivera",
    email: "alex@prospect.app",
    photoURL: null,
    country: "United States",
    postalCode: "94016",
    city: "San Francisco",
    state: "California",
    region: "North America",
    interests: [
      "Internships",
      "Technology",
      "Artificial Intelligence",
      "Scholarships",
      "Startup Programs",
    ],
    careerGoals: "Software Engineer and future startup founder",
    referralSource: "Hack Club",
    notifications: { ...DEFAULT_NOTIFICATIONS },
    profileCompletion: 100,
    onboarded: true,
    isAdmin: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
