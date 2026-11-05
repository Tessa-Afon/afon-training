import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SitePage from "@/components/SitePage";
import { CourseFacts } from "@/components/CourseCard";
import BookingForm from "@/components/BookingForm";
import { COURSES, findCourse, formatDate, formatPrice, formatTimeRange } from "@/lib/courses";
import { paymentDueDate } from "@/lib/booking";
import { availabilityFor, isBookable, loadCounts, ukToday } from "@/lib/availability";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

// Rendered on every visit: the form needs the current places left.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const course = findCourse((await params).slug);
  return { title: course ? `Book: ${course.title} · Afon Training` : "Course not found" };
}

export default async function BookCoursePage({ params }: Params) {
  const course = findCourse((await params).slug);
  if (!course) notFound();

  const today = ukToday();
  const availability = availabilityFor(course, await loadCounts(), today);
  // Full or closed: back to the course page, which says why.
  if (!isBookable(availability)) redirect(`/courses/${course.slug}`);

  const due = paymentDueDate(course.date);

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
                slug: course.slug,
                title: course.title,
                dateLabel: formatDate(course.date),
                timeLabel: formatTimeRange(course),
                pricePerPerson: course.pricePerPerson,
                priceLabel: formatPrice(course.pricePerPerson),
                maxPlaces: availability.capacity ?? course.maxAttendees,
                placesLeft: availability.left,
                paymentDueLabel: due > today ? formatDate(due) : null,
              }}
            />
          </div>
          <aside className="course-card">
            <h2 className="section-title">{course.title}</h2>
            <CourseFacts course={course} capacity={availability.capacity} />
          </aside>
        </div>
      </section>
    </SitePage>
  );
}
