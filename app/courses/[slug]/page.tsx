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

  return (
    <SitePage current="courses">
      <section className="page-heading">
        <div className="wrap">
          <p className="eyebrow"><Link href="/courses">Upcoming courses</Link></p>
          <h1>{course.title}</h1>
          <div className="page-lede"><p>{course.description}</p></div>
        </div>
      </section>
      <section className="band band-tight">
        <div className="wrap">
          <div className="course-card course-card-single">
            <CourseStatusBadge course={course} />
            <CourseFacts course={course} />
            {course.status !== "Fully booked" && (
              <Link className="btn btn-primary" href={`/courses/${course.slug}/book`}>Book places</Link>
            )}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
