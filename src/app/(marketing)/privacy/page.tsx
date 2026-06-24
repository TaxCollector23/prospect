import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Prospect collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 24, 2026">
      <LegalSection heading="Our commitment">
        <p>
          Prospect is built to help you discover opportunities. We collect the
          minimum information needed to personalize your experience, and we{" "}
          <strong>never sell your personal data</strong>.
        </p>
      </LegalSection>
      <LegalSection heading="Information we collect">
        <p>
          When you create an account we collect your name and email. During
          onboarding you may provide your interests, career goals, country, and
          (optionally) a postal code used solely to surface relevant local
          opportunities.
        </p>
        <p>
          We also record limited activity (opportunities you view, save, or
          apply to) to improve your recommendations.
        </p>
      </LegalSection>
      <LegalSection heading="How we use your data">
        <p>
          Your data powers the recommendation engine that ranks opportunities
          for you, sends the notifications you opt into, and helps us improve the
          product. Analytics are aggregated and never used to identify you to
          third parties.
        </p>
      </LegalSection>
      <LegalSection heading="Location data">
        <p>
          We use location only to recommend relevant opportunities. You can
          remove or change it anytime from your profile. We do not sell or share
          precise location with advertisers.
        </p>
      </LegalSection>
      <LegalSection heading="Your rights">
        <p>
          You can view and edit your profile, change notification preferences,
          and request deletion of your account and associated data at any time.
        </p>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>
          Questions about privacy? Email{" "}
          <a href="mailto:privacy@prospect.app" className="text-primary hover:underline">
            privacy@prospect.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
