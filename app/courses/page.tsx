import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import CourseCard from "@/components/CourseCard";
import { groupByMonth, upcomingCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "Upcoming courses · Afon Training" };

// Rebuild hourly so past courses drop off without a redeploy.
export const revalidate = 3600;

export default function CoursesPage() {
  const courses = upcomingCourses();

  return (
    <SitePage current="courses">
      <PageHeading title="Upcoming courses">
        <p>
          Browse forthcoming training courses below. Select Book places to
          reserve places for your team; you can send attendee names later.
        </p>
      </PageHeading>

      <section className="band band-tight">
        <div className="wrap">
          {courses.length > 0 ? (
            <div className="course-months">
              {groupByMonth(courses).map((g) => (
                <section key={g.month} aria-labelledby={`month-${g.month.replace(" ", "-")}`}>
                  <h2 className="month-heading" id={`month-${g.month.replace(" ", "-")}`}>
                    {g.month}
                  </h2>
                  <div className="course-list">
                    {g.courses.map((c) => <CourseCard key={c.slug} course={c} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>New course dates coming soon</h2>
              <p>
                We are preparing our upcoming programme. Please contact us if
                you would like to register your interest or discuss bespoke
                training for your organisation.
              </p>
              <Link className="btn btn-primary" href="/contact">Contact us</Link>
            </div>
          )}
        </div>
      </section>
    </SitePage>
  );
}
