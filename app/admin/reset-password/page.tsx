"use client";

import Link from "next/link";
import { useActionState } from "react";
import AuthCard from "../AuthCard";
import { sendPasswordReset, type FormState } from "../auth-actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendPasswordReset, { error: null });
  if (state.done) {
    return (
      <AuthCard
        title="Check your email"
        lede="If that address has an account, we have sent it a link to set a new password. The link works once and expires after an hour."
      >
        <p className="gate-lede"><Link href="/admin/sign-in">Back to sign in</Link></p>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Set a new password" lede="Enter your email and we'll send you a link.">
      <form action={action} className="gate-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send the link"}
        </button>
      </form>
      <p className="gate-lede"><Link href="/admin/sign-in">Back to sign in</Link></p>
    </AuthCard>
  );
}
