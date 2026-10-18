// Contact address for enquiries and bookings (an alias on Tess's Zoho
// mailbox).
export const CONTACT_EMAIL = "bookings@afontraining.co.uk";

export const CONTACT_PHONE = "07773 413025";
export const CONTACT_PHONE_HREF = "tel:+447773413025";

export const SITE_NAME = "Afon Training";

export function contactHref(subject = "Afon Training enquiry", body?: string) {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT_EMAIL}?${params.join("&")}`;
}
