import { db } from "@/lib/supabase/admin";
import { boardOwnerId } from "@/lib/tasks-access";
import { TASK_COLUMNS, todayISO, type Task } from "@/lib/tasks";
import Board from "./Board";

export default async function TasksPage() {
  const ownerId = await boardOwnerId();
  const { data, error } = await db()
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("owner_id", ownerId)
    .neq("status", "Done")
    .order("created_at", { ascending: false });
  if (error) {
    return (
      <p className="admin-warning">
        The task board isn&apos;t set up on this database yet (run supabase/migrations/0003_tasks.sql and 0004_task_columns.sql). {error.message}
      </p>
    );
  }
  const { count } = await db()
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("status", "Done");
  return <Board initial={(data ?? []) as Task[]} doneCount={count ?? 0} today={todayISO()} />;
}
