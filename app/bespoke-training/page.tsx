import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Bespoke training · Afon Training" };

const SECTORS = [
  { name: "GP practices", text: "Training for clinical and non-clinical practice staff." },
  { name: "Hospitals", text: "Courses for ward, department and support teams." },
  { name: "Care homes", text: "Practical sessions for carers, nurses and managers." },
  { name: "Leisure sector", text: "Training for staff working with the public in leisure settings." },
];

export default function BespokeTrainingPage() {
  return (
    <SitePage current="bespoke">
      <PageHeading title="Bespoke training">
        <p>
          We can run any of our courses privately for your organisation, at
          your premises or online, on a date that suits you. We can also adapt
          the content to your setting and your staff. Tell us what you need and
          we will talk it through with you.
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
            <h2>Plan training for your organisation</h2>
            <p>Let us know your organisation, how many people need training, whether you&apos;d like it onsite or online, and roughly when.</p>
          </div>
          <div className="actions">
            <Link className="btn btn-primary" href="/contact">Get in touch</Link>
            <Link className="btn btn-secondary" href="/courses">View courses</Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
