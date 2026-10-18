import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, contactHref } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us · Afon Training" };

export default function ContactPage() {
  return (
    <SitePage current="contact">
      <PageHeading title="Contact us">
        <p>
          To ask a question or discuss training for your organisation, send us
          a message, email or call. To book places, choose a course on the{" "}
          <Link href="/courses">courses page</Link>.
        </p>
      </PageHeading>

      <section className="band band-tight">
        <div className="wrap contact-grid">
          <div className="contact-card">
            <h2 className="section-title">Send us a message</h2>
            <ContactForm />
          </div>
          <div className="contact-details">
            <div>
              <p className="eyebrow">Email</p>
              <p className="contact-email">
                <a href={contactHref()}>{CONTACT_EMAIL}</a>
              </p>
            </div>
            <div>
              <p className="eyebrow">Telephone</p>
              <p className="contact-email">
                <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
