import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SitePage from "@/components/SitePage";
import { CourseFacts, CourseStatusBadge } from "@/components/CourseCard";
import { COURSES, findCourse } from "@/lib/courses";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const course = findCourse((await params).slug);
  return { title: course ? `${course.title} · Afon Training` : "Course not found" };
}

export default async function CoursePage({ params }: Params) {
  const course = findCourse((await params).slug);
  if (!course) notFound();

  const d = course.details;
  const bookable = course.status !== "Fully booked";
  const card = (
    <div className="course-card course-card-single">
      <CourseStatusBadge course={course} />
      <CourseFacts course={course} />
      {bookable && (
        <Link className="btn btn-primary" href={`/courses/${course.slug}/book`}>Book places</Link>
      )}
    </div>
  );

  return (
    <SitePage current="courses">
      <section className="page-heading">
        <div className="wrap">
          <p className="eyebrow"><Link href="/courses">Upcoming courses</Link></p>
          <h1>{course.title}</h1>
          <div className="page-lede">
            {d && <p className="page-subtitle">{d.subtitle}</p>}
            <p>{course.description}</p>
          </div>
        </div>
      </section>
      <section className="band band-tight">
        {d ? (
          <div className="wrap course-detail">
            <div className="prose course-detail-body">
              {d.intro.map((para) => <p key={para}>{para}</p>)}
              {d.includes && <p className="course-includes">{d.includes}</p>}
              <h2>Who should attend?</h2>
              <ul>{d.whoShouldAttend.map((x) => <li key={x}>{x}</li>)}</ul>
              <h2>What will the workshop cover?</h2>
              <ul>{d.covers.map((x) => <li key={x}>{x}</li>)}</ul>
              <h2>Learning outcomes</h2>
              <p>By the end of the workshop, delegates should be able to:</p>
              <ul>{d.outcomes.map((x) => <li key={x}>{x}</li>)}</ul>
              {d.beforeAttending && (
                <>
                  <h2>Before attending</h2>
                  <p>{d.beforeAttending}</p>
                </>
              )}
            </div>
            <aside className="course-detail-aside">{card}</aside>
          </div>
        ) : (
          <div className="wrap">{card}</div>
        )}
      </section>
    </SitePage>
  );
}
