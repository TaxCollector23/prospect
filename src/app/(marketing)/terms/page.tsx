import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Prospect.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 24, 2026">
      <LegalSection heading="Acceptance of terms">
        <p>
          By accessing or using Prospect, you agree to these Terms of Service. If
          you do not agree, please do not use the platform.
        </p>
      </LegalSection>
      <LegalSection heading="Using Prospect">
        <p>
          Prospect provides a discovery platform that aggregates and recommends
          opportunities. You agree to use it lawfully and not to misuse,
          scrape, or disrupt the service.
        </p>
      </LegalSection>
      <LegalSection heading="Opportunity listings">
        <p>
          We strive to surface accurate, high-quality opportunities, but Prospect
          does not own or operate the opportunities listed. Always verify details
          (deadlines, eligibility, and application steps) on the official site
          before applying. Prospect is not responsible for third-party decisions.
        </p>
      </LegalSection>
      <LegalSection heading="Accounts">
        <p>
          You are responsible for safeguarding your account credentials and for
          all activity under your account. Notify us promptly of any
          unauthorized use.
        </p>
      </LegalSection>
      <LegalSection heading="Intellectual property">
        <p>
          The Prospect name, logo, and software are owned by Prospect. Content
          you submit remains yours, but you grant us a license to display it as
          needed to operate the service.
        </p>
      </LegalSection>
      <LegalSection heading="Limitation of liability">
        <p>
          Prospect is provided &ldquo;as is&rdquo; without warranties of any
          kind. To the maximum extent permitted by law, we are not liable for
          indirect or consequential damages arising from your use of the
          platform.
        </p>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:legal@prospect.app" className="text-primary hover:underline">
            legal@prospect.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
