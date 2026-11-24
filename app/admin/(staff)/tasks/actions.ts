"use server";

// Server functions for the task board. Each one checks who is signed in
// and only ever touches that person's own tasks.
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff";
import { CATEGORIES, TASK_COLUMNS, cleanPatch, type Category, type Task, type TaskPatch } from "@/lib/tasks";

export async function addTask(title: string, category: Category): Promise<Task> {
  const staff = await requireStaff();
  const patch = cleanPatch({ title, category: CATEGORIES.includes(category) ? category : "Work" });
  const { data, error } = await db()
    .from("tasks")
    .insert({ ...patch, owner_id: staff.userId, status: patch.category === "Reminder" ? "Today" : "Inbox" })
    .select(TASK_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(id: string, input: TaskPatch): Promise<Task> {
  const staff = await requireStaff();
  const patch = cleanPatch(input);
  const changes: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if ("status" in patch) changes.done_at = patch.status === "Done" ? new Date().toISOString() : null;
  const { data, error } = await db()
    .from("tasks")
    .update(changes)
    .eq("id", id)
    .eq("owner_id", staff.userId)
    .select(TASK_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tasks/done");
  return data as Task;
}

/** Renames a tag on every one of this person's tasks. */
export async function renameTag(from: string, to: string): Promise<void> {
  const staff = await requireStaff();
  const { tag } = cleanPatch({ tag: to });
  const { error } = await db()
    .from("tasks")
    .update({ tag, updated_at: new Date().toISOString() })
    .eq("owner_id", staff.userId)
    .eq("tag", from);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tasks");
}

export async function deleteTask(id: string): Promise<void> {
  const staff = await requireStaff();
  const { error } = await db().from("tasks").delete().eq("id", id).eq("owner_id", staff.userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tasks/done");
}

/** Form action on the Done page: put a task back on the board. */
export async function restoreTask(form: FormData) {
  await updateTask(String(form.get("id")), { status: "Today" });
  revalidatePath("/admin/tasks");
}
