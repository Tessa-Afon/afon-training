import Link from "next/link";

export default function ContactPrompt() {
  return (
    <section className="band">
      <div className="wrap">
        <div className="contact-card prompt">
          <div>
            <h2>Looking for bespoke training?</h2>
            <p>
              We can run courses privately for your organisation, onsite or
              online. Get in touch to talk it through.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/contact">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
