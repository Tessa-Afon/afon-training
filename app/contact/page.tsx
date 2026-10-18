import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { CONTACT_EMAIL, contactHref } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us · Afon Training" };

export default function ContactPage() {
  return (
    <SitePage current="contact">
      <PageHeading title="Contact us">
        <p>
          To book a course, ask a question or discuss training for your
          organisation, please email us and we will get back to you.
        </p>
      </PageHeading>

      <section className="band band-tight">
        <div className="wrap contact-grid">
          <div className="contact-card">
            <p className="eyebrow">Email</p>
            <p className="contact-email">
              <a href={contactHref()}>{CONTACT_EMAIL}</a>
            </p>
            <a className="btn btn-primary" href={contactHref()}>Email us</a>
          </div>
          <div className="prose">
            <h2 className="section-title">When booking, please include</h2>
            <ul>
              <li>The course name and date</li>
              <li>Your name and organisation</li>
              <li>A telephone number</li>
              <li>How many places you need</li>
            </ul>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
