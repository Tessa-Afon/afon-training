import Link from "next/link";
import AuthCard from "../AuthCard";
import SignInForm from "./SignInForm";
import { ADMIN_CONFIGURED, MISSING_SETTINGS } from "@/lib/staff";

export default function SignInPage() {
  if (!ADMIN_CONFIGURED) {
    return (
      <AuthCard title="Not set up yet" lede="The admin area needs its database before anyone can sign in.">
        {MISSING_SETTINGS.length > 0 && (
          <p className="gate-lede">Missing on this deploy: {MISSING_SETTINGS.join(", ")}</p>
        )}
        <p className="gate-lede"><Link href="/">Back to the website</Link></p>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Sign in">
      <SignInForm />
      <p className="gate-lede"><Link href="/admin/reset-password">Forgotten your password?</Link></p>
    </AuthCard>
  );
}
