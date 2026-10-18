import type { MetadataRoute } from "next";
import { IS_LIVE } from "@/lib/site-gate";

// Only the live site is indexed; the dev sandbox and previews stay hidden.
export default function robots(): MetadataRoute.Robots {
  return IS_LIVE
    ? { rules: { userAgent: "*", allow: "/" } }
    : { rules: { userAgent: "*", disallow: "/" } };
}
