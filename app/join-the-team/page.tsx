import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Join the team · Afon Training" };

const TRAINERS_EMAIL = "trainers@afontraining.co.uk";
const TRAINERS_HREF = `mailto:${TRAINERS_EMAIL}?subject=${encodeURIComponent("Joining the Afon Training team")}`;

const AREAS = [
  "Customer service",
  "Finance",
  "CQC",
  "Chaperoning",
  "Medical record summarising",
  "Another area relevant to healthcare teams",
];

export default function JoinTheTeamPage() {
  return (
    <SitePage current="join">
      <PageHeading title="Join the team">
        <p>
          Afon Training is looking for knowledgeable, engaging trainers to
          deliver high-quality courses to GP practice teams and other
          healthcare settings.
        </p>
      </PageHeading>

      <section className="band band-white">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">Your expertise</p>
            <h2>Share what you know</h2>
          </div>
          <div className="prose">
            <p>
              Whether your expertise lies in one of these areas or another
              relevant subject, we would love to hear from you.
            </p>
            <ul>
              {AREAS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>Training that fits around you</h2>
          </div>
          <div className="prose">
            <p>
              You can deliver training face to face or online via Microsoft
              Teams, with flexibility around the courses and dates that suit
              you. Trainers work with us on a freelance basis.
            </p>
            <p>
              Join us in helping teams feel confident, capable and well
              supported in their roles.
            </p>
          </div>
        </div>
      </section>

      <section className="band band-heather">
        <div className="wrap prompt">
          <div>
            <h2>Interested?</h2>
            <p>
              For an informal conversation, email us at{" "}
              <a href={TRAINERS_HREF}>{TRAINERS_EMAIL}</a>.
            </p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href={TRAINERS_HREF}>Email us</a>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
