import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/SitePage";
import PageHeading from "@/components/PageHeading";
import { BOOKINGS_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Booking terms · Afon Training" };

// Draft for Tess to confirm, in particular the cancellation charges.
// Payment timing must match PAYMENT_DUE_DAYS in lib/booking.ts.
export default function BookingTermsPage() {
  return (
    <SitePage>
      <PageHeading title="Booking terms">
        <p>
          These terms apply to places booked on our scheduled courses. For
          training arranged for your organisation, we will agree terms with you
          directly.
        </p>
      </PageHeading>
      <section className="band band-tight">
        <div className="wrap prose">
          <h2>Booking and confirmation</h2>
          <p>
            Book through the <Link href="/courses">courses page</Link>. Your
            booking is confirmed when we email you to confirm it, and we will
            send an invoice at the same time. Attendee names can follow later.
          </p>

          <h2>Payment</h2>
          <p>
            Payment is due 6 weeks before the course date. If you book less than
            6 weeks before the course, payment is due on receipt of the invoice.
            We may release places that have not been paid for by the due date.
          </p>

          <h2>Changing who attends</h2>
          <p>
            You can send a colleague in place of a booked attendee at any time,
            at no extra cost. Just let us know their name and email address
            before the course.
          </p>

          <h2>If you need to cancel</h2>
          <p>Please tell us by email. The charge depends on how much notice you give:</p>
          <ul>
            <li>More than 6 weeks before the course: no charge.</li>
            <li>Between 2 and 6 weeks before the course: 50% of the course fee.</li>
            <li>Less than 2 weeks before the course, or not attending: the full course fee.</li>
          </ul>
          <p>
            Instead of cancelling, you can move a place to a later date of the
            same course, once, if you ask at least 2 weeks before the course.
          </p>

          <h2>If we need to cancel or change a course</h2>
          <p>
            Occasionally we may need to cancel or reschedule a course, for
            example if too few people have booked or the trainer is unwell. We
            will tell you as soon as possible and offer a place on another date
            or a full refund of anything you have paid. We are not responsible
            for any other costs.
          </p>

          <h2>Joining an online course</h2>
          <p>
            Our scheduled courses run live on Microsoft Teams. We will email
            joining details before the course. Each attendee needs their own
            device with a camera, microphone and a reliable internet
            connection, and should join a few minutes early.
          </p>

          <h2>Questions</h2>
          <p>
            Email <a href={`mailto:${BOOKINGS_EMAIL}`}>{BOOKINGS_EMAIL}</a> with
            any questions about a booking.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
