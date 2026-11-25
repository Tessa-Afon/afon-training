// Who may open the task board at /tasks: anyone with the simple board
// password (TASKS_PASSWORD in Netlify). The board belongs to one staff
// member, found by TASKS_OWNER_EMAIL (Tess by default). The cookie holds a
// hash of the password, never the password, so changing the password
// locks everyone out.
import { cookies } from "next/headers";
import { db } from "./supabase/admin";

export const TASKS_COOKIE = "afon_tasks";
export const TASKS_CONFIGURED = Boolean(process.env.TASKS_PASSWORD);
const OWNER_EMAIL = (process.env.TASKS_OWNER_EMAIL || "tessa@afontraining.co.uk").toLowerCase();

export async function tasksToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`afon-tasks:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hasTasksAccess(): Promise<boolean> {
  // Read the cookie first: it also keeps these pages from being built ahead.
  const cookie = (await cookies()).get(TASKS_COOKIE)?.value;
  const password = process.env.TASKS_PASSWORD;
  if (!password) return false;
  return !!cookie && cookie === (await tasksToken(password));
}

/** The board owner's user id, or an error if the password hasn't been given. */
export async function boardOwnerId(): Promise<string> {
  if (!(await hasTasksAccess())) throw new Error("Please enter the tasks password again (refresh the page).");
  const { data, error } = await db().from("staff").select("user_id").ilike("email", OWNER_EMAIL).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`No staff member with the email ${OWNER_EMAIL}.`);
  return data.user_id as string;
}
