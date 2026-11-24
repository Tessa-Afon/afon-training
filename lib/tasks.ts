// The task board (rebuilt from DoneNow): shared types and rules, used by
// the board page, its server actions and the import script's checks.

export const COLUMNS = ["Inbox", "Today", "This Week", "Waiting", "Later"] as const;
export const STATUSES = [...COLUMNS, "Done"] as const;
export const CATEGORIES = ["Work", "Personal", "Reminder"] as const;

export type Column = (typeof COLUMNS)[number];
export type Status = (typeof STATUSES)[number];
export type Category = (typeof CATEGORIES)[number];
export type Note = { date: string; text: string };

export type Task = {
  id: string;
  title: string;
  notes: Note[];
  status: Status;
  category: Category;
  is_priority: boolean;
  tag: string | null;
  sub_tag: string | null;
  due_date: string | null;
  done_at: string | null;
  created_at: string;
};

/** Fields the board may change. */
export type TaskPatch = Partial<
  Pick<Task, "title" | "status" | "category" | "is_priority" | "tag" | "sub_tag" | "due_date" | "notes">
>;

export const TASK_COLUMNS =
  "id, title, notes, status, category, is_priority, tag, sub_tag, due_date, done_at, created_at";

export const COLUMN_LABELS: Record<Column, string> = {
  Inbox: "Inbox",
  Today: "Today",
  "This Week": "This Week",
  Waiting: "Waiting on Others",
  Later: "Later",
};

/** Today's date as YYYY-MM-DD in UK time. */
export function todayISO(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

/** A note's date, as DoneNow wrote them: 24/11/26. */
export function noteDate(now = new Date()): string {
  return now.toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function formatDue(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

/** Past its due date. */
export const isOverdue = (t: Pick<Task, "due_date">, today: string) => !!t.due_date && t.due_date < today;

/** Reminders show on the board from their date onwards (or straight away
 *  if they have none); the rest wait in the Reminders list. */
export const reminderShowsNow = (t: Pick<Task, "category" | "due_date">, today: string) =>
  t.category !== "Reminder" || !t.due_date || t.due_date <= today;

/** Order within a column: priority first, then by due date (undated
 *  first, as DoneNow did), then newest first. */
export function sortColumn(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
    if (a.due_date !== b.due_date) {
      if (!a.due_date) return -1;
      if (!b.due_date) return 1;
      return a.due_date < b.due_date ? -1 : 1;
    }
    return a.created_at < b.created_at ? 1 : -1;
  });
}

const clean = (v: unknown, max: number) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().slice(0, max);
  return s || null;
};

/** Checks and tidies a change from the browser; drops anything unknown. */
export function cleanPatch(input: TaskPatch): TaskPatch {
  const out: TaskPatch = {};
  if ("title" in input) {
    const title = clean(input.title, 500);
    if (!title) throw new Error("A task needs a title.");
    out.title = title;
  }
  if ("status" in input) {
    if (!STATUSES.includes(input.status as Status)) throw new Error("Unknown column.");
    out.status = input.status;
  }
  if ("category" in input) {
    if (!CATEGORIES.includes(input.category as Category)) throw new Error("Unknown category.");
    out.category = input.category;
  }
  if ("is_priority" in input) out.is_priority = Boolean(input.is_priority);
  if ("tag" in input) out.tag = clean(input.tag, 60);
  if ("sub_tag" in input) out.sub_tag = clean(input.sub_tag, 60);
  if ("due_date" in input) {
    const d = clean(input.due_date, 10);
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error("Due date must be a date.");
    out.due_date = d;
  }
  if ("notes" in input) {
    if (!Array.isArray(input.notes)) throw new Error("Notes must be a list.");
    out.notes = input.notes
      .map((n) => ({ date: String(n?.date ?? "").slice(0, 20), text: String(n?.text ?? "").trim().slice(0, 5000) }))
      .filter((n) => n.text);
  }
  return out;
}
