// Aliases on Tess's Zoho mailbox: info@ for general enquiries, bookings@
// for anything about a booking.
export const CONTACT_EMAIL = "info@afontraining.co.uk";
export const BOOKINGS_EMAIL = "bookings@afontraining.co.uk";

// Chris's mailbox. New-booking alerts go here, and customers' replies to
// booking emails come here.
export const ADMIN_EMAIL = "admin@afontraining.co.uk";

export const POSTAL_ADDRESS = "6a South Street, Castlethorpe, MK19 7EL";

export const CONTACT_PHONE = "07773 413025";
export const CONTACT_PHONE_HREF = "tel:+447773413025";

export const SITE_NAME = "Afon Training";

export function contactHref(subject = "Afon Training enquiry", body?: string) {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT_EMAIL}?${params.join("&")}`;
}
