import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff";
import { TASK_COLUMNS, type Task } from "@/lib/tasks";
import { restoreTask } from "../actions";

export const metadata: Metadata = { title: "Done tasks" };

export default async function DonePage() {
  const staff = await requireStaff();
  const { data, error } = await db()
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("owner_id", staff.userId)
    .eq("status", "Done")
    .order("done_at", { ascending: false, nullsFirst: false })
    .limit(300);
  if (error) return <p className="admin-warning">{error.message}</p>;
  const tasks = (data ?? []) as Task[];
  return (
    <>
      <div className="admin-title">
        <h1>Done</h1>
        <Link href="/admin/tasks">Back to the board</Link>
      </div>
      <div className="admin-panel">
        {tasks.length === 0 ? (
          <p>Nothing done yet. Drag a card onto Done on the board.</p>
        ) : (
          <ul className="grid gap-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2">
                <span>
                  {t.title}
                  {t.done_at && (
                    <span className="ml-2 text-sm text-[var(--ink-soft)]">
                      {new Date(t.done_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </span>
                <form action={restoreTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="link-button">Back to Today</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
