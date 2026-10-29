import Link from "next/link";
import { type Course, type CourseImage, formatDate, formatPrice, formatTimeRange } from "@/lib/courses";

export function CourseFacts({ course }: { course: Course }) {
  return (
    <dl className="course-facts">
      <div><dt>Date</dt><dd>{formatDate(course.date)}</dd></div>
      <div><dt>Time</dt><dd>{formatTimeRange(course)}</dd></div>
      <div><dt>Delivery</dt><dd>{course.delivery}</dd></div>
      <div><dt>Price</dt><dd>{formatPrice(course.pricePerPerson)} per person</dd></div>
      <div><dt>Places</dt><dd>Maximum {course.maxAttendees} attendees</dd></div>
    </dl>
  );
}

export function CourseStatusBadge({ course }: { course: Course }) {
  const tone = course.status === "Fully booked" ? "closed" : "open";
  return <p className={`course-status course-status-${tone}`}>{course.status}</p>;
}

// Image header shared by every course card on the site.
export function CourseCardImage({ image }: { image: CourseImage }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- mix of SVG placeholders and photos
    <img className="course-card-photo" src={image.src} alt={image.alt} width={600} height={400} />
  );
}

export default function CourseCard({ course }: { course: Course }) {
  const bookable = course.status !== "Fully booked";
  return (
    <article className="course-card">
      <CourseCardImage image={course.image} />
      <div className="course-card-head">
        <h3>
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        <CourseStatusBadge course={course} />
      </div>
      <p className="course-description">{course.description}</p>
      <CourseFacts course={course} />
      {bookable && (
        <Link className="btn btn-primary" href={`/courses/${course.slug}/book`}>Book places</Link>
      )}
    </article>
  );
}
