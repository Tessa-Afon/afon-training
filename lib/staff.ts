// Who is signed in to the admin area, and what they may do. Every admin
// page and action calls requireStaff(): signed in, two-step verified, and
// listed in the staff table.
import { redirect } from "next/navigation";
import { AUTH_CONFIGURED, authClient } from "./supabase/auth";
import { DATABASE_CONFIGURED, db } from "./supabase/admin";
import type { Course } from "./courses";

export type Role = "owner" | "admin" | "trainer";

export type Staff = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  trainerName: string | null;
};

export const ADMIN_CONFIGURED = AUTH_CONFIGURED && DATABASE_CONFIGURED;

/** Where a signed-in person must go next before they can use the admin
 *  area, or null if they're through: set up or enter a two-step code. */
async function nextStep(): Promise<"/admin/sign-in" | "/admin/two-step" | null> {
  const supabase = await authClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return "/admin/sign-in";
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return aal?.currentLevel === "aal2" ? null : "/admin/two-step";
}

/** The signed-in staff member, or a redirect to sign in. Returns null
 *  when signed in and verified but not on the staff list. */
export async function currentStaff(): Promise<Staff | null> {
  if (!ADMIN_CONFIGURED) redirect("/admin/sign-in");
  const step = await nextStep();
  if (step) redirect(step);

  const supabase = await authClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims!.claims.sub;
  const { data } = await db()
    .from("staff")
    .select("user_id, name, email, role, trainer_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    userId: data.user_id,
    name: data.name,
    email: data.email,
    role: data.role,
    trainerName: data.trainer_name,
  };
}

/** For pages: the staff member, or the "no access" page. */
export async function requireStaff(): Promise<Staff> {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/no-access");
  return staff;
}

/** For server actions that change things: owner or admin only. */
export async function requireEditor(): Promise<Staff> {
  const staff = await requireStaff();
  if (!canEdit(staff)) throw new Error("Not allowed");
  return staff;
}

/** For settings and the FreeAgent connection: the owner only. */
export async function requireOwner(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "owner") throw new Error("Not allowed");
  return staff;
}

export const canEdit = (s: Staff) => s.role === "owner" || s.role === "admin";

/** Trainers see only their own courses. */
export const canSee = (s: Staff, c: Pick<Course, "trainer">) =>
  canEdit(s) || (s.trainerName !== null && s.trainerName === c.trainer);
