// Netlify Forms. Netlify can't see forms rendered by React, so every form
// is also declared in public/__forms.html (same form name, same field
// names) and submissions are POSTed to that static file. Submissions are
// stored in Netlify (Forms tab) and emailed to the address set there.
export type FormName = "contact" | "booking";

export async function submitNetlifyForm(form: HTMLFormElement): Promise<boolean> {
  const body = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") body.append(key, value);
  });
  try {
    const res = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
