// Booking terms: payment is due 6 weeks (42 days) before the course date.
export const PAYMENT_DUE_DAYS = 42;

/** ISO date (YYYY-MM-DD) on which payment for a course is due. */
export function paymentDueDate(courseDateIso: string): string {
  const d = new Date(`${courseDateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - PAYMENT_DUE_DAYS);
  return d.toISOString().slice(0, 10);
}
