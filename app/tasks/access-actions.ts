"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TASKS_COOKIE, tasksToken } from "@/lib/tasks-access";

export type UnlockState = { error: string | null };

/** Checks the board password and remembers it on this device for a year. */
export async function unlockTasks(_prev: UnlockState, form: FormData): Promise<UnlockState> {
  const password = process.env.TASKS_PASSWORD;
  const attempt = String(form.get("password") ?? "");
  // Compare hashes so the check takes the same time whatever is typed.
  if (!password || (await tasksToken(attempt)) !== (await tasksToken(password))) {
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That password isn't right. Please try again." };
  }
  (await cookies()).set(TASKS_COOKIE, await tasksToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/tasks",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/tasks");
}

export async function lockTasks() {
  (await cookies()).delete({ name: TASKS_COOKIE, path: "/tasks" });
  redirect("/tasks");
}
