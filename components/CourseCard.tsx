import Link from "next/link";
import { type Course, formatDate, formatPrice, formatTimeRange } from "@/lib/courses";
import { type Availability, isBookable } from "@/lib/availability";

export function CourseFacts({ course, capacity }: { course: Course; capacity?: number | null }) {
  return (
    <dl className="course-facts">
      <div><dt>Date</dt><dd>{formatDate(course.date)}</dd></div>
      <div><dt>Time</dt><dd>{formatTimeRange(course)}</dd></div>
      <div><dt>Delivery</dt><dd>{course.delivery}</dd></div>
      <div><dt>Price</dt><dd>{formatPrice(course.pricePerPerson)} per person</dd></div>
      <div><dt>Places</dt><dd>Maximum {capacity ?? course.maxAttendees} attendees</dd></div>
    </dl>
  );
}

export function CourseStatusBadge({ availability }: { availability: Availability }) {
  return <p className={`course-status course-status-${availability.state}`}>{availability.label}</p>;
}

export function BookButton({ course, availability }: { course: Course; availability: Availability }) {
  if (isBookable(availability)) {
    return <Link className="btn btn-primary" href={`/courses/${course.slug}/book`}>Book places</Link>;
  }
  return (
    <Link className="btn btn-secondary" href="/contact">
      {availability.state === "full" ? "Ask about the next date" : "Contact us"}
    </Link>
  );
}

export default function CourseCard({ course, availability }: { course: Course; availability: Availability }) {
  return (
    <article className="course-card">
      <div className="course-card-head">
        <h3>
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        <CourseStatusBadge availability={availability} />
      </div>
      <p className="course-description">{course.description}</p>
      <CourseFacts course={course} capacity={availability.capacity} />
      <BookButton course={course} availability={availability} />
    </article>
  );
}
