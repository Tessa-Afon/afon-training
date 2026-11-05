"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "../auth-actions";

export default function SignInForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, { error: null });
  return (
    <form action={action} className="gate-form">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} key={state.email} />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {state.error && <p className="gate-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
