import { redirect } from "next/navigation";
import AuthCard from "../AuthCard";
import TwoStepForm from "./TwoStepForm";
import { authClient } from "@/lib/supabase/auth";
import { ADMIN_CONFIGURED } from "@/lib/staff";

// Every admin sign-in needs a code from an authenticator app (Microsoft
// Authenticator, Google Authenticator and so on). First time: set it up.
export default async function TwoStepPage() {
  if (!ADMIN_CONFIGURED) redirect("/admin/sign-in");
  const supabase = await authClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) redirect("/admin/sign-in");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect("/admin");
  const enrolled = aal?.nextLevel === "aal2";

  return enrolled ? (
    <AuthCard title="Enter your code" lede="Open your authenticator app and enter the six-digit code for Afon Training.">
      <TwoStepForm enrol={false} />
    </AuthCard>
  ) : (
    <AuthCard
      title="Set up two-step sign-in"
      lede="The admin area holds customers' details, so every sign-in needs a code from an authenticator app on your phone, such as Microsoft Authenticator or Google Authenticator."
    >
      <TwoStepForm enrol />
    </AuthCard>
  );
}
