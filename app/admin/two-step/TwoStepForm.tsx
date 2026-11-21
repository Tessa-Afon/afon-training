"use client";

import { useActionState, useEffect, useState } from "react";
import { startEnrolment, verifyCode, type EnrolState, type FormState } from "../auth-actions";

export default function TwoStepForm({ enrol }: { enrol: boolean }) {
  const [setup, setSetup] = useState<EnrolState | null>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(verifyCode, { error: null });

  useEffect(() => {
    if (enrol) startEnrolment().then(setSetup);
  }, [enrol]);

  if (enrol && !setup) return <p className="gate-lede">Preparing…</p>;
  if (setup?.error) return <p className="gate-error" role="alert">{setup.error}</p>;

  return (
    <form action={action} className="gate-form">
      {setup?.qrCode && (
        <>
          <p className="gate-lede">1. In the app, add an account and scan this code:</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- an SVG data URL from Supabase */}
          <img className="mfa-qr" src={setup.qrCode} alt="QR code for your authenticator app" width={180} height={180} />
          <p className="gate-lede">
            Can&apos;t scan it? Enter this key instead: <code className="mfa-secret">{setup.secret}</code>
          </p>
          <p className="gate-lede">2. Enter the six-digit code the app shows:</p>
          <input type="hidden" name="factorId" value={setup.factorId} />
        </>
      )}
      <label htmlFor="code">Six-digit code</label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]{6,7}"
        maxLength={7}
        required
        autoFocus
      />
      {state.error && <p className="gate-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Checking…" : enrol ? "Finish set-up" : "Continue"}
      </button>
    </form>
  );
}
