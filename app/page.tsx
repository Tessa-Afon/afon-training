import Link from "next/link";
import SitePage from "@/components/SitePage";
import FlowLines from "@/components/FlowLines";
import ContactPrompt from "@/components/ContactPrompt";

const SECTORS = ["GP practices", "Hospitals", "Care homes", "Leisure sector"];

export default function Home() {
  return (
    <SitePage current="home">
      <section className="hero">
        <FlowLines />
        <div className="wrap">
          <h1>Practical training for confident teams</h1>
          <p className="lede">
            Clear, relevant courses for people working in GP practices,
            hospitals, care homes and the leisure sector.
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
            clear and approachable way. Browse upcoming courses and book places
            online.
          </p>
        </div>
      </section>

      <section className="band band-heather">
        <div className="wrap prompt">
          <div>
            <h2>Upcoming courses</h2>
            <p>View course dates, times and prices on our courses page.</p>
          </div>
          <Link className="btn btn-primary" href="/courses">View courses</Link>
        </div>
      </section>

      <ContactPrompt />
    </SitePage>
  );
}
