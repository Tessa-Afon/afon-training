import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { CourseCardImage } from "@/components/CourseCard";
import { ProTrainingsBadge, ProTrainingsVideo, TqukWidget } from "@/components/ProTrainings";
import { FIRST_AID_COURSES, type FirstAidCourse } from "@/lib/firstAid";

export const metadata: Metadata = { title: "First Aid and BLS · Afon Training" };

function FirstAidCard({ course }: { course: FirstAidCourse }) {
  const facts = [
    ["Duration", course.duration],
    ["Delivery", course.delivery],
    ["Certificate", course.certificate],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <article className="course-card" id={course.slug}>
      <CourseCardImage image={course.image} />
      <h3>{course.title}</h3>
      {course.description.map((p) => <p key={p} className="course-description">{p}</p>)}
      {course.note && <p className="course-note">{course.note}</p>}
      {facts.length > 0 && (
        <dl className="course-facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      <Link className="btn btn-secondary" href="/contact">Contact us to discuss your requirements</Link>
    </article>
  );
}

export default function FirstAidPage() {
  return (
    <SitePage current="firstaid">
      <PageHeading title="First Aid and BLS">
        <p>
          Accredited first aid, basic life support and anaphylaxis training,
          delivered face to face or combined with e-learning.
        </p>
      </PageHeading>

      <section className="band band-tight">
        <div className="wrap">
          <div className="course-list">
            {FIRST_AID_COURSES.map((c) => <FirstAidCard key={c.slug} course={c} />)}
          </div>
        </div>
      </section>

      <section className="band band-white">
        <div className="wrap intro">
          <div>
            <p className="eyebrow">Accreditation</p>
            <h2>TQUK qualifications through ProTrainings</h2>
          </div>
          <div className="prose">
            <p>Tess is a certified ProTrainings instructor, and our first aid qualifications are awarded through TQUK.</p>
            <TqukWidget />
            <ProTrainingsBadge />
            <ProTrainingsVideo />
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="contact-card prompt">
            <div>
              <h2>Talk to us about your requirements</h2>
              <p>
                We would be happy to discuss your requirements, available
                options, and bespoke course combinations. Please get in touch
                to arrange a call.
              </p>
            </div>
            <Link className="btn btn-primary" href="/contact">Contact us</Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
