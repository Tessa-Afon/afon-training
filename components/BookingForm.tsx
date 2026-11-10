"use client";

import { useState } from "react";
import { submitNetlifyForm } from "@/lib/forms";
import Link from "next/link";
import { ADMIN_EMAIL } from "@/lib/site";
import { createBooking } from "@/app/courses/[slug]/book/actions";

export type BookingCourse = {
  slug: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  pricePerPerson: number;
  priceLabel: string;
  maxPlaces: number;
  /** Places left, when the site counts bookings; null otherwise. */
  placesLeft: number | null;
  /** Formatted payment due date, or null if the course is under 6 weeks away. */
  paymentDueLabel: string | null;
};

type Status = "idle" | "sending" | "sent" | "error";

// Website bookings are saved to the database, which checks places are
// still free. Deploys without a database send to Netlify Forms instead.

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default function BookingForm({ course }: { course: BookingCourse }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [emailed, setEmailed] = useState(false);
  const [maxPlaces, setMaxPlaces] = useState(course.placesLeft ?? course.maxPlaces);
  const [places, setPlaces] = useState(1);
  const [namesNow, setNamesNow] = useState(false);
  const total = gbp(places * course.pricePerPerson);
  const paymentDue = course.paymentDueLabel
    ? `6 weeks before the course (by ${course.paymentDueLabel})`
    : "on receipt of invoice (the course is less than 6 weeks away)";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setMessage(null);
    try {
      const result = await createBooking(course.slug, new FormData(form));
      switch (result.status) {
        case "booked":
          setReference(result.reference);
          setEmailed(result.emailed);
          setStatus("sent");
          break;
        case "fallback":
          setStatus((await submitNetlifyForm(form)) ? "sent" : "error");
          break;
        case "unavailable":
          if (result.placesLeft !== null) setMaxPlaces(result.placesLeft);
          setMessage(result.message);
          setStatus("idle");
          break;
        case "invalid":
          setMessage(result.message);
          setStatus("idle");
          break;
        default:
          setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-done" role="status">
        <h2 className="section-title">Booking received</h2>
        {reference && (
          <p>
            Your reference is <strong>{reference}</strong>.
            {emailed && " We have emailed you a copy of your booking."}
          </p>
        )}
        <p>
          Thank you. We are holding your {places === 1 ? "place" : `${places} places`} on{" "}
          <strong>{course.title}</strong> ({course.dateLabel}) and will confirm by email and
          send an invoice. Payment is due {paymentDue}.
        </p>
        {!namesNow && (
          <p>
            You can send attendee names to{" "}
            <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a> whenever you have them.
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="site-form" onSubmit={onSubmit}>
      <input type="hidden" name="form-name" value="booking" />
      <input type="hidden" name="course" value={course.title} />
      <input type="hidden" name="course-date" value={course.dateLabel} />
      <input type="hidden" name="course-time" value={course.timeLabel} />
      <input type="hidden" name="price-per-person" value={course.priceLabel} />
      <input type="hidden" name="payment-due" value={paymentDue} />
      <input type="hidden" name="estimated-total" value={total} />
      <p className="visually-hidden" aria-hidden="true">
        <label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
      </p>

      <p className="form-note form-key">
        Fields marked <span className="required" aria-hidden="true">*</span> must be filled in.
      </p>

      <fieldset>
        <legend>Places</legend>
        <div className="field field-narrow">
          <label htmlFor="b-places">Number of places <span className="required" aria-hidden="true">*</span></label>
          <input
            id="b-places"
            name="places"
            type="number"
            min={1}
            max={maxPlaces}
            value={places}
            onChange={(e) => setPlaces(Math.max(1, Math.min(maxPlaces, Number(e.target.value) || 1)))}
            required
          />
        </div>
        {maxPlaces <= 5 && (
          <p className="form-note">
            Only {maxPlaces} {maxPlaces === 1 ? "place" : "places"} left on this date.
          </p>
        )}
        <p className="form-note">
          {places} × {course.priceLabel} = <strong>{total}</strong>
        </p>
      </fieldset>

      <fieldset>
        <legend>Booking contact</legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor="b-name">Your name <span className="required" aria-hidden="true">*</span></label>
            <input id="b-name" name="contact-name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="b-org">Practice or organisation <span className="required" aria-hidden="true">*</span></label>
            <input id="b-org" name="organisation" autoComplete="organization" required />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="b-email">Email <span className="required" aria-hidden="true">*</span></label>
            <input id="b-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="b-phone">Telephone <span className="required" aria-hidden="true">*</span></label>
            <input id="b-phone" name="phone" type="tel" autoComplete="tel" required />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Invoice details</legend>
        <div className="field">
          <label htmlFor="b-address">Invoice address <span className="required" aria-hidden="true">*</span></label>
          <textarea id="b-address" name="invoice-address" rows={3} autoComplete="street-address" required />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="b-invoice-email">
              Send the invoice to <span className="optional">(optional, if not the email above)</span>
            </label>
            <input id="b-invoice-email" name="invoice-email" type="email" />
          </div>
          <div className="field">
            <label htmlFor="b-po">Purchase order number <span className="optional">(optional)</span></label>
            <input id="b-po" name="po-number" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Attendees</legend>
        <div className="choice">
          <input
            id="b-names-later"
            type="radio"
            name="attendees-known"
            value="Names to follow"
            checked={!namesNow}
            onChange={() => setNamesNow(false)}
          />
          <label htmlFor="b-names-later">I will send attendee names later</label>
        </div>
        <div className="choice">
          <input
            id="b-names-now"
            type="radio"
            name="attendees-known"
            value="Names given"
            checked={namesNow}
            onChange={() => setNamesNow(true)}
          />
          <label htmlFor="b-names-now">I can give attendee names now</label>
        </div>
        {namesNow && (
          <div className="field">
            <label htmlFor="b-attendees">Attendee names and email addresses, one per line <span className="required" aria-hidden="true">*</span></label>
            <textarea id="b-attendees" name="attendees" rows={Math.min(8, Math.max(3, places))} required />
          </div>
        )}
      </fieldset>

      <div className="field">
        <label htmlFor="b-notes">Anything else we should know? <span className="optional">(optional)</span></label>
        <textarea id="b-notes" name="notes" rows={3} />
      </div>

      <div className="choice choice-terms">
        <input id="b-terms" type="checkbox" name="payment-terms" value="Accepted" required />
        <label htmlFor="b-terms">
          I accept the <Link href="/booking-terms" target="_blank">booking terms</Link> and understand
          that payment is due {paymentDue}.
        </label>
      </div>

      {message && (
        <p className="form-error" role="alert">{message}</p>
      )}
      {status === "error" && (
        <p className="form-error" role="alert">
          Sorry, your booking could not be sent. Please try again, or email us at{" "}
          <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>.
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Book places"}
      </button>
    </form>
  );
}
