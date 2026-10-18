import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Netlify's deploy context at build time: "production" for main,
    // "branch-deploy" for the dev sandbox, "deploy-preview" for previews.
    // Inlined so the password gate and robots rules can depend on it.
    SITE_DEPLOY_CONTEXT: process.env.CONTEXT ?? "",
  },
};

export default nextConfig;
