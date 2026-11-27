"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STAFF_HINT_COOKIE } from "@/lib/staff-hint";
import { authClient } from "@/lib/supabase/auth";

/** After signing in: straight in, unless authenticator codes are switched
 *  back on (TWO_STEP_REQUIRED in lib/staff.ts). */
const AFTER_SIGN_IN = TWO_STEP_REQUIRED ? "/admin/two-step" : "/admin";

export type FormState = { error: string | null; done?: boolean; email?: string };

import { MIN_PASSWORD, TWO_STEP_REQUIRED } from "@/lib/staff";

const text = (f: FormData, name: string) => String(f.get(name) ?? "").trim();

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const supabase = await authClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  // The form clears itself after submitting, so hand the email back.
  if (error) return { error: "That email and password don't match. Please try again.", email: text(form, "email") };
  redirect(AFTER_SIGN_IN);
}

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  (await cookies()).delete(STAFF_HINT_COOKIE);
  redirect("/admin/sign-in");
}

/** Emails a link to set a new password. Always says it was sent, so the
 *  form can't be used to find out who has an account. */
export async function sendPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const supabase = await authClient();
  const { error } = await supabase.auth.resetPasswordForEmail(text(form, "email"));
  if (error) console.error("Password reset email failed", error);
  return { error: null, done: true };
}

export async function setPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD) return { error: `Please use at least ${MIN_PASSWORD} characters.` };
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords don't match." };
  const supabase = await authClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Set password failed", error);
    return { error: "The password couldn't be saved. The link may have expired; please ask for a new one." };
  }
  redirect(AFTER_SIGN_IN);
}

export type EnrolState = FormState & { factorId?: string; qrCode?: string; secret?: string };

/** Starts setting up an authenticator app: returns the QR code to scan. */
export async function startEnrolment(): Promise<EnrolState> {
  const supabase = await authClient();
  // Clear any half-finished set-up from an earlier visit.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator app" });
  if (error || !data) {
    console.error("MFA enrol failed", error);
    return { error: "Two-step set-up couldn't start. Please reload the page." };
  }
  return { error: null, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

/** Checks a six-digit code: finishes set-up, or completes sign-in. */
export async function verifyCode(_prev: FormState, form: FormData): Promise<FormState> {
  const supabase = await authClient();
  let factorId = text(form, "factorId");
  if (!factorId) {
    const { data } = await supabase.auth.mfa.listFactors();
    factorId = data?.totp.find((f) => f.status === "verified")?.id ?? "";
  }
  if (!factorId) return { error: "Two-step verification isn't set up yet. Please reload the page." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: text(form, "code").replace(/\s/g, ""),
  });
  if (error) return { error: "That code isn't right. Check the app and try the latest code." };
  redirect("/admin");
}
