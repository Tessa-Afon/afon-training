import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy · Afon Training" };

// Covers the contact and booking forms (Netlify Forms). Extend once
// online payment or analytics are added.
export default function PrivacyPage() {
  return (
    <SitePage>
      <PageHeading title="Privacy notice" />
      <section className="band band-tight">
        <div className="wrap prose">
          <h2>What we collect</h2>
          <p>
            If you use our contact form, we receive your name, email address,
            message and, if you give them, your telephone number and
            organisation.
          </p>
          <p>
            If you use our booking form, we receive the booking contact&apos;s
            name, organisation, email address and telephone number, invoice
            details, the course and number of places, and any attendee names
            and email addresses you choose to give us.
          </p>
          <p>
            If you email or call us, we receive the details you choose to
            share.
          </p>
          <p>
            Form submissions are processed and stored for us by Netlify, our
            website host, and sent to us by email.
          </p>
          <h2>How we use it</h2>
          <p>
            We use those details only to answer your enquiry, to arrange and
            invoice any booking you make, and to send joining details to
            attendees. We do not sell or share your
            details for marketing.
          </p>
          <h2>Cookies</h2>
          <p>
            This website does not use tracking or advertising cookies.
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
