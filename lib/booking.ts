import { formatDate } from "./courses";

// Booking terms: payment is due 6 weeks (42 days) before the course date.
export const PAYMENT_DUE_DAYS = 42;

// Free cancellation up to this many days before the course starts.
export const FREE_CANCELLATION_DAYS = 7;

/** ISO date (YYYY-MM-DD) on which payment for a course is due. */
export function paymentDueDate(courseDateIso: string): string {
  const d = new Date(`${courseDateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - PAYMENT_DUE_DAYS);
  return d.toISOString().slice(0, 10);
}

/** "6 weeks before the course (by Tuesday 2 March 2027)", or on receipt
 *  of invoice when the course is less than 6 weeks away. */
export function paymentDueText(courseDateIso: string, todayIso: string): string {
  const due = paymentDueDate(courseDateIso);
  return due > todayIso
    ? `6 weeks before the course (by ${formatDate(due)})`
    : "on receipt of invoice (the course is less than 6 weeks away)";
}
