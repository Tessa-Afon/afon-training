import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <Link className="brand" href="/">Afon Training</Link>
          <p>Practical training for professional teams.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/courses">Courses</Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
      <div className="legal">
        <div className="wrap">© {new Date().getFullYear()} Afon Training</div>
      </div>
    </footer>
  );
}
