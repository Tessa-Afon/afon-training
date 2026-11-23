import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Courses in Scotland · Afon Training" };

export default function CoursesInScotlandPage() {
  return (
    <SitePage current="courses">
      <PageHeading title="Courses in Scotland">
        <p>
          Our courses for people working in Scotland are coming soon.
        </p>
      </PageHeading>

      <section className="band band-white">
        <div className="wrap">
          <div className="prose">
            <p>
              To ask about training for your organisation in Scotland, or to
              hear when dates are available, get in touch and we will be happy
              to help.
            </p>
          </div>
          <div className="actions" style={{ marginTop: 24 }}>
            <Link className="btn btn-primary" href="/contact">Contact us</Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
