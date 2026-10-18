import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SitePage from "@/components/SitePage";
import { CourseFacts } from "@/components/CourseCard";
import BookingForm from "@/components/BookingForm";
import { COURSES, findCourse, formatDate, formatPrice, formatTimeRange } from "@/lib/courses";
import { paymentDueDate } from "@/lib/booking";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.filter((c) => c.status !== "Fully booked").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const course = findCourse((await params).slug);
  return { title: course ? `Book: ${course.title} · Afon Training` : "Course not found" };
}

export default async function BookCoursePage({ params }: Params) {
  const course = findCourse((await params).slug);
  if (!course || course.status === "Fully booked") notFound();

  // Static page: the "under 6 weeks" case is decided at build time, and
  // the site rebuilds whenever courses change.
  const due = paymentDueDate(course.date);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <SitePage current="courses">
      <section className="page-heading">
        <div className="wrap">
          <p className="eyebrow">
            <Link href={`/courses/${course.slug}`}>{course.title}</Link>
          </p>
          <h1>Book places</h1>
          <div className="page-lede">
            <p>
              Book now even if you don&apos;t yet know who will attend: tell us
              how many places you need and send names later.
            </p>
          </div>
        </div>
      </section>
      <section className="band band-tight">
        <div className="wrap booking-grid">
          <div className="contact-card">
            <BookingForm
              course={{
                title: course.title,
                dateLabel: formatDate(course.date),
                timeLabel: formatTimeRange(course),
                pricePerPerson: course.pricePerPerson,
                priceLabel: formatPrice(course.pricePerPerson),
                maxPlaces: course.maxAttendees,
                paymentDueLabel: due > today ? formatDate(due) : null,
              }}
            />
          </div>
          <aside className="course-card">
            <h2 className="section-title">{course.title}</h2>
            <CourseFacts course={course} />
          </aside>
        </div>
      </section>
    </SitePage>
  );
}
