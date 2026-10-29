import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <Link className="brand" href="/">Afon Training</Link>
          <p>Practical training for confident teams.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/courses">Courses</Link>
          <Link href="/first-aid">First Aid and BLS</Link>
          <Link href="/about">About</Link>
          <Link href="/join-the-team">Join the team</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/booking-terms">Booking terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
      <div className="legal">
        <div className="wrap">© {new Date().getFullYear()} Afon Training</div>
      </div>
    </footer>
  );
}
