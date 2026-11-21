// A plain "this browser belongs to staff" hint, so the public menu can show
// an Admin link. It grants nothing: every admin page still checks sign-in,
// two-step and the staff list. Set when a staff page loads; cleared on sign out.
export const STAFF_HINT_COOKIE = "afon_staff";
export const STAFF_HINT_MAX_AGE = 60 * 60 * 24 * 30;
