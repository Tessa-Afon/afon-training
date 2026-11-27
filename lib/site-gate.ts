// Whether this deploy is the live site (Netlify production context, i.e.
// main) rather than the sandbox (dev) or a preview. The sandbox is no
// longer password-protected (27 Nov 2026): it shows a SANDBOX banner and is
// hidden from search engines.
export const IS_LIVE = process.env.SITE_DEPLOY_CONTEXT === "production";
