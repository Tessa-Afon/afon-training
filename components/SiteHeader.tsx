"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";
import { STAFF_HINT_COOKIE } from "@/lib/staff-hint";

export type NavKey = "home" | "courses" | "firstaid" | "bespoke" | "about" | "join" | "contact";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "courses", href: "/courses", label: "Courses" },
  { key: "firstaid", href: "/first-aid", label: "First Aid and BLS" },
  { key: "bespoke", href: "/bespoke-training", label: "Bespoke training" },
  { key: "about", href: "/about", label: "About" },
  { key: "join", href: "/join-the-team", label: "Join the team" },
  { key: "contact", href: "/contact", label: "Contact" },
];

export default function SiteHeader({ current }: { current?: NavKey }) {
  const [open, setOpen] = useState(false);
  // Admin link for staff only (the admin area checks sign-in itself).
  const [staff, setStaff] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the cookie is only readable after hydration
    setStaff(document.cookie.split("; ").includes(`${STAFF_HINT_COOKIE}=1`));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="Afon Training home">
          <BrandMark />
          Afon Training
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" />
        </button>
        <nav id="main-nav" className={open ? "nav nav-open" : "nav"} aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.key} href={l.href} aria-current={current === l.key ? "page" : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {staff && (
            <Link className="nav-admin" href="/admin" onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
