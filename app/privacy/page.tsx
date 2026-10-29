import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { CONTACT_EMAIL, POSTAL_ADDRESS } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy · Afon Training" };

// Covers the contact and booking forms (Netlify Forms). Extend once
// online payment or analytics are added.
export default function PrivacyPage() {
  return (
    <SitePage>
      <PageHeading title="Privacy notice" />
      <section className="band band-tight">
        <div className="wrap prose">
          <h2>Who we are</h2>
          <p>
            Afon Training is run by Tessa Clarke, who is responsible for the
            personal information described here. You can write to us at{" "}
            {POSTAL_ADDRESS}, or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
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
            attendees. We do not sell or share your details for marketing.
          </p>
          <h2>How long we keep it</h2>
          <p>
            We keep enquiries for up to 12 months after our last contact with
            you. We keep booking and invoice records for 6 years, as required
            for tax and accounting purposes, and then delete them.
          </p>
          <h2>Cookies</h2>
          <p>
            This website does not use tracking or advertising cookies. The
            First Aid and BLS page shows a badge, a TQUK widget and a video
            supplied by ProTrainings, which are loaded from their servers and
            may set their own cookies.
          </p>
          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete the information we hold
            about you by emailing{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you are
            unhappy with how we have handled your information, you can complain
            to the Information Commissioner&apos;s Office at{" "}
            <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
