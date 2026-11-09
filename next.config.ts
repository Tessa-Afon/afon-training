import type { NextConfig } from "next";

// Where the site is built: Netlify sets CONTEXT, Vercel sets VERCEL_ENV.
// Both are turned into Netlify's words, so the rest of the site only knows
// "production" (main, live), "branch-deploy" (the dev sandbox) and
// "deploy-preview" (a pull request preview).
const onVercel = Boolean(process.env.VERCEL_ENV);
const https = (host?: string) => (host ? `https://${host}` : undefined);
const deployContext = onVercel
  ? process.env.VERCEL_ENV === "production"
    ? "production"
    : process.env.VERCEL_GIT_COMMIT_REF === "dev"
      ? "branch-deploy"
      : "deploy-preview"
  : (process.env.CONTEXT ?? "");
const deployUrl = onVercel
  ? deployContext === "production"
    ? https(process.env.VERCEL_PROJECT_PRODUCTION_URL)
    : https(process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL)
  : process.env.CONTEXT === "production"
    ? process.env.URL
    : process.env.DEPLOY_PRIME_URL;

const nextConfig: NextConfig = {
  env: {
    // Inlined so the password gate, banner and robots rules can depend on it.
    SITE_DEPLOY_CONTEXT: deployContext,
    // Which host built it: the forms post to Netlify Forms or to /api/form.
    SITE_HOST: onVercel ? "vercel" : "netlify",
    // This deploy's own address, for links in emails (the live domain on
    // main, the sandbox address on dev).
    SITE_URL: process.env.SITE_URL ?? deployUrl ?? "http://localhost:3000",
  },
  async redirects() {
    // The page was renamed from "Training for your team" in October 2026.
    return [
      { source: "/training-for-your-team", destination: "/bespoke-training", permanent: true },
    ];
  },
};

export default nextConfig;
