import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy · Afon Training" };

// Draft. To be reviewed before launch, and extended once online booking,
// payments or analytics are added.
export default function PrivacyPage() {
  return (
    <SitePage>
      <PageHeading title="Privacy notice" />
      <section className="band band-tight">
        <div className="wrap prose">
          <h2>What we collect</h2>
          <p>
            This website does not ask you for personal information. If you
            email us, we receive the details you choose to send, such as your
            name, organisation, telephone number and the course you are
            interested in.
          </p>
          <h2>How we use it</h2>
          <p>
            We use those details only to answer your enquiry and to arrange
            any booking you ask us to make. We do not sell or share your
            details for marketing.
          </p>
          <h2>Cookies</h2>
          <p>
            While the site is in preview, it sets one cookie to remember that
            you have entered the preview password. It is not used for
            tracking.
          </p>
          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete the information we hold
            about you by emailing {CONTACT_EMAIL}.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
