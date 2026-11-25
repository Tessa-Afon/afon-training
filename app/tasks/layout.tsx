import type { Metadata } from "next";
import { hasTasksAccess, TASKS_CONFIGURED } from "@/lib/tasks-access";
import { lockTasks } from "./access-actions";
import Unlock from "./Unlock";

export const metadata: Metadata = { title: "Tasks · Afon Training", robots: { index: false, follow: false } };

// Every page under /tasks asks for the board password first.
export default async function TasksLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasTasksAccess())) return <Unlock configured={TASKS_CONFIGURED} />;
  return (
    <div className="admin">
      <main className="admin-main">
        <div className="wrap">
          {children}
          <form action={lockTasks} className="text-sm">
            <button type="submit" className="link-button">Lock the board on this device</button>
          </form>
        </div>
      </main>
    </div>
  );
}
