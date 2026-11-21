"use client";

import { useActionState } from "react";
import AuthCard from "../AuthCard";
import { setPassword, type FormState } from "../auth-actions";

// Reached from an invitation or password-reset email (via auth/confirm).
export default function SetPasswordPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(setPassword, { error: null });
  return (
    <AuthCard title="Choose a password" lede="At least 12 characters. A short phrase is easier to remember than a jumble.">
      <form action={action} className="gate-form">
        <label htmlFor="password">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
        <label htmlFor="confirm">Type it again</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
        {state.error && <p className="gate-error" role="alert">{state.error}</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthCard>
  );
}
