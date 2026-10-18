// Simple password gate for the dev sandbox and deploy previews. The live
// site (Netlify production context, i.e. main) is open to everyone. The
// password lives in the SITE_PASSWORD environment variable; the cookie holds
// a hash of it, never the password itself, and changing the password signs
// everyone out.
export const IS_LIVE = process.env.SITE_DEPLOY_CONTEXT === "production";
export const GATE_COOKIE = "afon_gate";

export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`afon-gate:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
