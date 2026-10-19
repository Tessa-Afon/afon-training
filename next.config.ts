import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Netlify's deploy context at build time: "production" for main,
    // "branch-deploy" for the dev sandbox, "deploy-preview" for previews.
    // Inlined so the password gate and robots rules can depend on it.
    SITE_DEPLOY_CONTEXT: process.env.CONTEXT ?? "",
  },
  async redirects() {
    // The page was renamed from "Training for your team" in October 2026.
    return [
      { source: "/training-for-your-team", destination: "/bespoke-training", permanent: true },
    ];
  },
};

export default nextConfig;
