// Form submissions. On Netlify they go to Netlify Forms: Netlify can't see
// forms rendered by React, so every form is also declared in
// public/__forms.html (same form name, same field names) and submissions are
// POSTed to that static file, stored in Netlify (Forms tab) and emailed to
// the address set there. On Vercel they go to /api/form, which emails every
// field to ADMIN_EMAIL through Resend.
export type FormName = "contact" | "booking";

const ON_VERCEL = process.env.SITE_HOST === "vercel";

export async function submitForm(form: HTMLFormElement): Promise<boolean> {
  const body = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") body.append(key, value);
  });
  try {
    const res = await fetch(ON_VERCEL ? "/api/form" : "/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
