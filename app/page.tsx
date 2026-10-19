import Link from "next/link";
import SitePage from "@/components/SitePage";
import FlowLines from "@/components/FlowLines";
import ContactPrompt from "@/components/ContactPrompt";
import { formatDate, upcomingCourses } from "@/lib/courses";

// Rebuild hourly so past courses drop off without a redeploy.
export const revalidate = 3600;


const SECTORS = ["GP practices", "Hospitals", "Care homes", "Leisure sector"];

export default function Home() {
  const next = upcomingCourses().slice(0, 3);

  return (
    <SitePage current="home">
      <section className="hero">
        <FlowLines />
        <div className="wrap">
          <h1>Practical training for confident teams</h1>
          <p className="lede">
            Clear, relevant courses, delivered live online via Microsoft Teams,
            for people working in GP practices, hospitals, care homes and the
            leisure sector.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/courses">View courses</Link>
            <Link className="btn btn-secondary" href="/contact">Contact us</Link>
          </div>
          <ul className="sectors" aria-label="Sectors we train">
            {SECTORS.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </section>

      <section className="band band-white">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">About our training</p>
            <h2>Training that fits real working life</h2>
          </div>
          <p>
            Afon Training provides focused, practical learning delivered in a
            clear and approachable way. Your team joins from work, with no
            travel. Browse upcoming courses and book places online.
          </p>
        </div>
      </section>

      <section className="band band-heather">
        <div className="wrap upcoming">
          <div className="upcoming-head">
            <h2>Upcoming courses</h2>
            <span className="booking-tag">All courses booking now</span>
          </div>
          {next.length > 0 ? (
            <ul className="upcoming-list">
              {next.map((c) => (
                <li key={c.slug}>
                  <p className="upcoming-date">{formatDate(c.date)}</p>
                  <h3><Link href={`/courses/${c.slug}`}>{c.title}</Link></h3>
                  <p>{c.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>New course dates are coming soon.</p>
          )}
          <Link className="btn btn-primary" href="/courses">See all courses and dates</Link>
        </div>
      </section>

      <ContactPrompt />
    </SitePage>
  );
}
