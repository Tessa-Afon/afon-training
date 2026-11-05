import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Netlify's deploy context at build time: "production" for main,
    // "branch-deploy" for the dev sandbox, "deploy-preview" for previews.
    // Inlined so the password gate and robots rules can depend on it.
    SITE_DEPLOY_CONTEXT: process.env.CONTEXT ?? "",
    // This deploy's own address, for links in emails (the live domain on
    // main, the dev-- address on the sandbox).
    SITE_URL:
      process.env.SITE_URL ??
      (process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL) ??
      "http://localhost:3000",
  },
  async redirects() {
    // The page was renamed from "Training for your team" in October 2026.
    return [
      { source: "/training-for-your-team", destination: "/bespoke-training", permanent: true },
    ];
  },
};

export default nextConfig;
