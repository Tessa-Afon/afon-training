import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import ContactPrompt from "@/components/ContactPrompt";

export const metadata: Metadata = { title: "About · Afon Training" };

export default function AboutPage() {
  return (
    <SitePage current="about">
      <PageHeading title="About Afon Training">
        <p>
          Afon Training provides focused, practical learning delivered in a
          clear and approachable way, for people working in GP practices,
          hospitals, care homes and the leisure sector.
        </p>
      </PageHeading>

      <section className="band band-white">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">Our approach</p>
            <h2>Training that fits real working life</h2>
          </div>
          <div className="prose">
            <p>
              Our courses are built around the situations people meet at work.
              Sessions are practical, clearly explained and sized so that
              everyone can take part.
            </p>
            <p>
              We keep booking simple: choose a course, contact us, and we will
              confirm your place and send you everything you need.
            </p>
          </div>
        </div>
      </section>

      <ContactPrompt />
    </SitePage>
  );
}
