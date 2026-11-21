// Aliases on Tess's Zoho mailbox: info@ for general enquiries, bookings@
// for anything about a booking.
export const CONTACT_EMAIL = "info@afontraining.co.uk";
export const BOOKINGS_EMAIL = "bookings@afontraining.co.uk";

// Chris's mailbox.
export const ADMIN_EMAIL = "admin@afontraining.co.uk";

export const TESS_EMAIL = "tessa@afontraining.co.uk";

// For now (Peter, 20 Nov 2026) new-booking alerts and customers' replies to
// booking emails go to all three, until everything is running properly.
export const BOOKING_TEAM = [ADMIN_EMAIL, BOOKINGS_EMAIL, TESS_EMAIL];

export const POSTAL_ADDRESS = "6a South Street, Castlethorpe, MK19 7EL";

export const CONTACT_PHONE = "07773 413025";
export const CONTACT_PHONE_HREF = "tel:+447773413025";

export const SITE_NAME = "Afon Training";

export function contactHref(subject = "Afon Training enquiry", body?: string) {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT_EMAIL}?${params.join("&")}`;
}
