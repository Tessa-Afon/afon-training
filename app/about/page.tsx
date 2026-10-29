import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import ContactPrompt from "@/components/ContactPrompt";
import Link from "next/link";

export const metadata: Metadata = { title: "About · Afon Training" };

export default function AboutPage() {
  return (
    <SitePage current="about">
      <PageHeading title="About Afon Training">
        <p>
          Practical courses for people working in GP practices, hospitals,
          care homes and the leisure sector, led by a trainer who has done the
          job.
        </p>
      </PageHeading>

      <section className="band band-white">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">Our approach</p>
            <h2>How we train</h2>
          </div>
          <div className="prose">
            <p>
              Our courses are built around the situations people meet at work.
              Sessions run live on Microsoft Teams, are practical and clearly
              explained, and are kept small so that everyone can take part.
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
              Tess has over 20 years&apos; experience as a Practice Manager,
              alongside experience in coaching and mentoring.
            </p>
            <ul className="credentials">
              <li>TQUK Level 3 Award in Education and Training</li>
              <li>
                TQUK Level 3 Instructor in First Aid at Work, including BLS,
                AED and anaphylaxis
              </li>
              <li>ILM Level 3 tutor (Institute of Leadership and Management)</li>
            </ul>
            <p>
              Tess was previously an Associate Trainer at Thornfields, teaching
              on their ILM Level 3 and Aspiring Practice Manager courses.
            </p>
            <p className="trainer-quote">
              Tess believes quality training is vital to enable, motivate and
              empower staff to be the best they can be, and in turn to provide
              the best care and outcomes for patients.
            </p>
            <p>
              Tess is certified by ProTrainings. See our{" "}
              <Link href="/first-aid">First Aid and BLS courses</Link>.
            </p>
          </div>
        </div>
      </section>

      <ContactPrompt />
    </SitePage>
  );
}
