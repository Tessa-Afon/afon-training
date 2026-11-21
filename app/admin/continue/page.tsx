import AuthCard from "../AuthCard";

type Props = { searchParams: Promise<{ token_hash?: string; type?: string }> };

// The page an invitation or password-reset link opens. The link is only
// used up when the button is pressed (see auth/confirm/route.ts), so email
// scanners that open links first can't spend it.
export default async function ContinuePage({ searchParams }: Props) {
  const { token_hash = "", type = "" } = await searchParams;
  const invite = type === "invite";
  return (
    <AuthCard
      title={invite ? "Welcome to Afon Training admin" : "Reset your password"}
      lede="Press the button to carry on. You'll choose a password next."
    >
      <form method="post" action="/admin/auth/confirm" className="gate-form">
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type} />
        <button className="btn btn-primary" type="submit">Continue</button>
      </form>
    </AuthCard>
  );
}
