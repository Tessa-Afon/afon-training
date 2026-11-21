import Link from "next/link";
import AuthCard from "../AuthCard";

export default function LinkExpiredPage() {
  return (
    <AuthCard
      title="That link has expired"
      lede="Email links work once and only for a limited time. Ask for a new one below, or ask Peter to resend your invitation."
    >
      <p className="gate-lede"><Link href="/admin/reset-password">Send a new link</Link></p>
    </AuthCard>
  );
}
