"use client";

import { useState } from "react";
import { submitNetlifyForm } from "@/lib/forms";
import { CONTACT_EMAIL } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setStatus((await submitNetlifyForm(e.currentTarget)) ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="form-done" role="status">
        <h2 className="section-title">Thank you</h2>
        <p>Your message has been sent. We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className="site-form" onSubmit={onSubmit}>
      <input type="hidden" name="form-name" value="contact" />
      <p className="visually-hidden" aria-hidden="true">
        <label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
      </p>

      <div className="field">
        <label htmlFor="c-name">Your name</label>
        <input id="c-name" name="name" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="c-phone">Telephone <span className="optional">(optional)</span></label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="c-org">Organisation <span className="optional">(optional)</span></label>
          <input id="c-org" name="organisation" autoComplete="organization" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" name="message" rows={5} required />
      </div>

      {status === "error" && (
        <p className="form-error" role="alert">
          Sorry, your message could not be sent. Please try again, or email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
