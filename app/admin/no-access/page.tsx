import AuthCard from "../AuthCard";
import { signOut } from "../auth-actions";

export default function NoAccessPage() {
  return (
    <AuthCard
      title="No access yet"
      lede="You are signed in, but your account hasn't been given access to the admin area. Please ask Peter to add you."
    >
      <form action={signOut} className="gate-form">
        <button className="btn btn-secondary" type="submit">Sign out</button>
      </form>
    </AuthCard>
  );
}
