"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Courses (the cards), the planner, and for those allowed Money owed and
// Settings, with the current one highlighted.
export default function AdminNav({ money, settings }: { money: boolean; settings: boolean }) {
  const path = usePathname();
  const LINKS = [
    { href: "/admin", label: "Courses" },
    { href: "/admin/planner", label: "Planner" },
    ...(money ? [{ href: "/admin/money", label: "Money owed" }] : []),
    ...(settings ? [{ href: "/admin/settings", label: "Settings" }] : []),
  ];
  const current = LINKS.slice(1).find((l) => path.startsWith(l.href))?.href ?? "/admin";
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
