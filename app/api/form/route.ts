// Contact and booking-request forms on Vercel (Netlify uses Netlify Forms
// instead, see lib/forms.ts): every field is emailed to ADMIN_EMAIL.
import { sendEmail } from "@/lib/email";
import { ADMIN_EMAIL, SITE_NAME } from "@/lib/site";

const FORMS: Record<string, string> = { contact: "Website enquiry", booking: "Booking request" };

export async function POST(req: Request) {
  const fields = new URLSearchParams(await req.text());
  const name = fields.get("form-name") ?? "";
  if (!FORMS[name]) return new Response("Unknown form", { status: 400 });
  // Bots fill the hidden field; pretend it worked.
  if (fields.get("bot-field")) return new Response("OK");

  const lines: string[] = [];
  fields.forEach((value, key) => {
    if (key !== "form-name" && key !== "bot-field" && value.trim()) lines.push(`${key}: ${value.slice(0, 5000)}`);
  });
  const who = fields.get("name") || fields.get("contact-name") || fields.get("email") || "someone";
  const email = fields.get("email") ?? "";
  const sent = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `${FORMS[name]} from ${who} (${SITE_NAME} website)`.slice(0, 200),
    text: lines.join("\n\n"),
    replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
  });
  return sent ? new Response("OK") : new Response("Not sent", { status: 502 });
}
