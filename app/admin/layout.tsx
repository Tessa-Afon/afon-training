import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Afon Training",
  robots: { index: false, follow: false },
};

// Admin pages are always rendered per request, for the signed-in person.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
