import Link from "next/link";
import BrandMark from "./BrandMark";

export type NavKey = "home" | "courses" | "team" | "about" | "contact";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "courses", href: "/courses", label: "Courses" },
  { key: "team", href: "/training-for-your-team", label: "Training for your team" },
  { key: "about", href: "/about", label: "About" },
  { key: "contact", href: "/contact", label: "Contact" },
];

export default function SiteHeader({ current }: { current?: NavKey }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="Afon Training home">
          <BrandMark />
          Afon Training
        </Link>
        <nav className="nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.key} href={l.href} aria-current={current === l.key ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
