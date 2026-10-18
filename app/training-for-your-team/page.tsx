import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { contactHref } from "@/lib/site";

export const metadata: Metadata = { title: "Training for your team · Afon Training" };

const SECTORS = [
  { name: "GP practices", text: "Training for clinical and non-clinical practice staff." },
  { name: "Hospitals", text: "Courses for ward, department and support teams." },
  { name: "Care homes", text: "Practical sessions for carers, nurses and managers." },
  { name: "Leisure sector", text: "Training for staff working with the public in leisure settings." },
];

export default function TeamTrainingPage() {
  return (
    <SitePage current="team">
      <PageHeading title="Training for your team">
        <p>
          We can run courses for your organisation, at a date and place that
          suits your team. Tell us what you need and we will talk it through
          with you.
        </p>
      </PageHeading>

      <section className="band band-white">
        <div className="wrap">
          <h2 className="section-title">Who we work with</h2>
          <ul className="sector-grid">
            {SECTORS.map((s) => (
              <li key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-heather">
        <div className="wrap prompt">
          <div>
            <h2>Talk to us about your team</h2>
            <p>Let us know your organisation, how many people need training and roughly when.</p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href={contactHref("Training for our team")}>Email us</a>
            <Link className="btn btn-secondary" href="/courses">View courses</Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
