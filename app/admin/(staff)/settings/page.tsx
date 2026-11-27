import Link from "next/link";
import { notFound } from "next/navigation";
import { MIN_PASSWORD, requireStaff } from "@/lib/staff";
import { db } from "@/lib/supabase/admin";
import { EMAIL_CONFIGURED } from "@/lib/email";
import { FREEAGENT_CONFIGURED, FREEAGENT_ENV, loadConnection } from "@/lib/freeagent";
import { disconnectFreeAgent, runMorningCheck, setStaffPassword } from "./actions";

type Props = { searchParams: Promise<{ notice?: string }> };

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(iso));

const ROLE_LABELS = { owner: "Owner", admin: "Admin", trainer: "Trainer" } as const;

export default async function SettingsPage({ searchParams }: Props) {
  const staff = await requireStaff();
  if (staff.role !== "owner") notFound();
  const { notice } = await searchParams;
  const [connection, people] = await Promise.all([
    loadConnection(),
    db().from("staff").select("user_id, name, email, role, trainer_name").order("name"),
  ]);

  return (
    <>
      <div className="admin-title"><h1>Settings</h1></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <section className="admin-panel admin-settings">
        <h2>FreeAgent</h2>
        {!FREEAGENT_CONFIGURED ? (
          <p>
            Not set up. Add <code>FREEAGENT_CLIENT_ID</code> and <code>FREEAGENT_CLIENT_SECRET</code> in Netlify (see
            docs/ADMIN_SETUP.md), redeploy, then connect here. Until then, invoices are raised by hand and their status
            set on each booking.
          </p>
        ) : connection ? (
          <>
            <dl>
              <div><dt>Connected to</dt><dd>{connection.company_name || "FreeAgent"} ({FREEAGENT_ENV === "live" ? "live account" : "test sandbox"})</dd></div>
              <div><dt>Connected by</dt><dd>{connection.connected_by}, {dateTime(connection.connected_at)}</dd></div>
              <div>
                <dt>Last morning check</dt>
                <dd>{connection.last_sync_at ? `${dateTime(connection.last_sync_at)}: ${connection.last_sync_result}` : "Not run yet"}</dd>
              </div>
            </dl>
            <div className="admin-actions">
              <form action={runMorningCheck}>
                <button className="btn btn-primary btn-small" type="submit">Run the morning check now</button>
              </form>
              <form action={disconnectFreeAgent}>
                <button className="btn btn-secondary btn-small btn-danger" type="submit">Disconnect</button>
              </form>
            </div>
            <p className="form-note">
              The morning check runs by itself at 6am (UTC) on the live site. It marks paid invoices and asks bookers for
              missing attendee names 3 weeks before the course.
            </p>
          </>
        ) : (
          <>
            <p>
              Not connected. Connecting takes you to FreeAgent ({FREEAGENT_ENV === "live" ? "the live account" : "the test sandbox"}) to
              sign in and approve, then brings you back here.
            </p>
            <div className="admin-actions">
              <a className="btn btn-primary btn-small" href="/admin/freeagent/connect">Connect FreeAgent</a>
              <form action={runMorningCheck}>
                <button className="btn btn-secondary btn-small" type="submit">Run the morning check now</button>
              </form>
            </div>
          </>
        )}
      </section>

      <section className="admin-panel admin-settings">
        <h2>Email</h2>
        <p>{EMAIL_CONFIGURED ? "Booking emails are sent through Resend." : "Not set up: RESEND_API_KEY is missing, so no emails are sent."}</p>
      </section>

      <section className="admin-panel admin-settings">
        <h2>People who can sign in</h2>
        <dl>
          {(people.data ?? []).map((p) => (
            <div key={p.email}>
              <dt>{p.name}</dt>
              <dd>
                {ROLE_LABELS[p.role as keyof typeof ROLE_LABELS]} · {p.email}
                {p.trainer_name && ` · sees courses for ${p.trainer_name}`}
                <form action={setStaffPassword.bind(null, p.user_id, p.name)} className="admin-inline-form">
                  <label className="sr-only" htmlFor={`pw-${p.user_id}`}>New password for {p.name}</label>
                  <input
                    id={`pw-${p.user_id}`}
                    name="password"
                    type="text"
                    autoComplete="off"
                    minLength={MIN_PASSWORD}
                    placeholder="New password"
                    required
                  />
                  <button className="btn btn-secondary btn-small" type="submit">Set password</button>
                </form>
              </dd>
            </div>
          ))}
        </dl>
        <p className="form-note">
          Everyone signs in with their email and password (at least {MIN_PASSWORD} characters). If someone forgets
          theirs, set a new one here and tell them. People are added in Supabase (see docs/ADMIN_SETUP.md, step 5).{" "}
          <Link href="/admin">Back to courses</Link>
        </p>
      </section>
    </>
  );
}
