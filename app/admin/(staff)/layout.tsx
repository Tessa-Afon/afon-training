import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { canEdit, requireStaff } from "@/lib/staff";
import { signOut } from "../auth-actions";

const ROLE_LABELS = { owner: "Owner", admin: "Admin", trainer: "Trainer" } as const;

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return (
    <div className="admin">
      <header className="admin-header">
        <div className="wrap">
          <Link className="brand" href="/admin">
            <BrandMark />
            Afon Training admin
          </Link>
          <nav className="admin-nav" aria-label="Admin">
            <Link href="/admin">Courses</Link>
            {canEdit(staff) && <Link href="/admin/money">Money owed</Link>}
            {staff.role === "owner" && <Link href="/admin/settings">Settings</Link>}
          </nav>
          <div className="admin-user">
            <span>
              {staff.name} <span className="admin-role">{ROLE_LABELS[staff.role]}</span>
            </span>
            <Link href="/" target="_blank">View website</Link>
            <form action={signOut}>
              <button className="link-button" type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="admin-main">
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}
