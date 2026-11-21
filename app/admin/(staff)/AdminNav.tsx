"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Courses" },
  { href: "/admin/planner", label: "Planner" },
];

// Courses (the cards) and the planner, with the current one highlighted.
export default function AdminNav() {
  const path = usePathname();
  const current = path.startsWith("/admin/planner") ? "/admin/planner" : "/admin";
  return (
    <nav className="admin-nav" aria-label="Admin">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={l.href === current ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
