import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import CourseCard from "@/components/CourseCard";
import { groupByMonth, upcomingCourses } from "@/lib/courses";
import { availabilityFor, loadCounts } from "@/lib/availability";

export const metadata: Metadata = { title: "Upcoming courses · Afon Training" };

// Rendered on every visit so place counts and banners are always current.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = upcomingCourses();
  const counts = await loadCounts();

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
                    {g.courses.map((c) => (
                      <CourseCard key={c.slug} course={c} availability={availabilityFor(c, counts)} />
                    ))}
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
