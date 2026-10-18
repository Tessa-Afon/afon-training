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
              We keep booking simple: choose a course, tell us how many places
              you need, and we will confirm and send an invoice. Attendee names
              can follow later.
            </p>
          </div>
        </div>
      </section>

      <section className="band" id="trainer">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">Your trainer</p>
            <h2>Tessa Clarke</h2>
          </div>
          <div className="prose">
            <p>
              Tessa leads every Afon Training course.
            </p>
            {/* Placeholder until Tess supplies her trainer profile:
                background, experience in primary care, qualifications. */}
            <p className="placeholder-note">
              A full trainer profile, covering Tessa&apos;s experience and
              qualifications, will be added here shortly.
            </p>
          </div>
        </div>
      </section>

      <ContactPrompt />
    </SitePage>
  );
}
