"use client";

import { useActionState } from "react";
import BrandMark from "@/components/BrandMark";
import { unlockTasks, type UnlockState } from "./access-actions";

const initial: UnlockState = { error: null };

export default function Unlock({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(unlockTasks, initial);
  return (
    <main className="gate">
      <div className="gate-card">
        <p className="brand">
          <BrandMark />
          Afon Training
        </p>
        <h1>Tasks</h1>
        {configured ? (
          <form action={action} className="gate-form">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? "password-error" : undefined}
            />
            {state.error && (
              <p id="password-error" className="gate-error" role="alert">
                {state.error}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Checking…" : "Open my tasks"}
            </button>
          </form>
        ) : (
          <p className="gate-lede">The task board isn&apos;t set up yet: TASKS_PASSWORD is missing in Netlify.</p>
        )}
      </div>
    </main>
  );
}
