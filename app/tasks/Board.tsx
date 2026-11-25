"use client";

// Tess's task board, rebuilt from DoneNow: five columns, drag a card (or
// use its buttons on a phone) to move it, drop it on Done to finish it.
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  CATEGORIES,
  COLUMNS,
  COLUMN_LABELS,
  formatDue,
  isOverdue,
  noteDate,
  reminderShowsNow,
  sortColumn,
  type Category,
  type Column,
  type Task,
  type TaskPatch,
} from "@/lib/tasks";
import { addTask, deleteTask, renameTag, updateTask } from "./actions";

const COLUMN_STYLE: Record<Column, { emoji: string; head: string; count: string }> = {
  Inbox: { emoji: "📥", head: "bg-blue-50 text-blue-900", count: "bg-blue-400" },
  Today: { emoji: "☀️", head: "bg-amber-50 text-amber-900", count: "bg-amber-400" },
  Farm: { emoji: "🐑", head: "bg-emerald-50 text-emerald-900", count: "bg-emerald-500" },
  House: { emoji: "🏠", head: "bg-purple-50 text-purple-900", count: "bg-purple-400" },
  Admin: { emoji: "🗂️", head: "bg-orange-50 text-orange-900", count: "bg-orange-400" },
};

const CATEGORY_STRIP: Record<Category, string> = {
  Work: "bg-blue-500",
  Personal: "bg-emerald-500",
  Reminder: "bg-yellow-400",
};

const CATEGORY_ON: Record<Category, string> = {
  Work: "bg-blue-500 text-white",
  Personal: "bg-emerald-500 text-white",
  Reminder: "bg-yellow-400 text-yellow-950",
};

/** Phone order: Today first, as in DoneNow; board order on wider screens. */
const PHONE_ORDER: Record<Column, string> = {
  Today: "order-1",
  Inbox: "order-2",
  Farm: "order-3",
  House: "order-4",
  Admin: "order-5",
};

const TAG_HUES = [200, 340, 160, 280, 30, 175, 260, 50, 210, 140, 320, 80, 230, 300, 15];
function tagStyle(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  const hue = TAG_HUES[hash % TAG_HUES.length];
  return { backgroundColor: `hsl(${hue}, 60%, 90%)`, color: `hsl(${hue}, 50%, 28%)` };
}

export default function Board({ initial, doneCount, today }: { initial: Task[]; doneCount: number; today: string }) {
  const [tasks, setTasks] = useState(initial);
  const [done, setDone] = useState(doneCount);
  const [filter, setFilter] = useState<"All" | "Work" | "Personal">("All");
  const [tag, setTag] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [problem, setProblem] = useState("");
  const [, startTransition] = useTransition();

  const allTags = useMemo(() => [...new Set(tasks.map((t) => t.tag).filter(Boolean) as string[])].sort(), [tasks]);
  const futureReminders = tasks.filter((t) => !reminderShowsNow(t, today));
  const visible = tasks.filter(
    (t) => reminderShowsNow(t, today) && (filter === "All" || t.category === filter) && (!tag || t.tag === tag),
  );
  const open = tasks.find((t) => t.id === openId) ?? null;

  function report(e: unknown) {
    setProblem(e instanceof Error ? e.message : "Something went wrong. Refresh the page and try again.");
  }

  /** Change a task straight away on screen, then save it. */
  function change(id: string, patch: TaskPatch) {
    const before = tasks;
    const finishing = patch.status === "Done";
    setTasks((ts) => (finishing ? ts.filter((t) => t.id !== id) : ts.map((t) => (t.id === id ? { ...t, ...patch } : t))));
    if (finishing) {
      setDone((n) => n + 1);
      setOpenId(null);
    }
    startTransition(async () => {
      try {
        const saved = await updateTask(id, patch);
        if (!finishing) setTasks((ts) => ts.map((t) => (t.id === id ? saved : t)));
      } catch (e) {
        setTasks(before);
        if (finishing) setDone((n) => n - 1);
        report(e);
      }
    });
  }

  function remove(id: string) {
    const before = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== id));
    setOpenId(null);
    startTransition(async () => {
      try {
        await deleteTask(id);
      } catch (e) {
        setTasks(before);
        report(e);
      }
    });
  }

  async function add(title: string, category: Category, thenOpen: boolean) {
    try {
      const task = await addTask(title, category);
      setTasks((ts) => [task, ...ts]);
      if (thenOpen) setOpenId(task.id);
    } catch (e) {
      report(e);
    }
  }

  async function retag(from: string, to: string) {
    const before = tasks;
    setTasks((ts) => ts.map((t) => (t.tag === from ? { ...t, tag: to.trim() || null } : t)));
    try {
      await renameTag(from, to);
    } catch (e) {
      setTasks(before);
      report(e);
    }
  }

  function drop(target: Column | "Done") {
    if (dragId) {
      const t = tasks.find((x) => x.id === dragId);
      if (t && t.status !== target) change(dragId, { status: target });
    }
    setDragId(null);
    setOver(null);
  }

  const dropProps = (target: Column | "Done") => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (over !== target) setOver(target);
    },
    onDragLeave: () => setOver((o) => (o === target ? null : o)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      drop(target);
    },
  });

  return (
    <div className="grid gap-5">
      <div className="admin-title">
        <h1>Tasks</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex gap-1 rounded-full bg-white p-1 border border-[var(--line)]">
            {(["All", "Work", "Personal"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1 font-medium ${
                  filter === f ? (f === "All" ? "bg-[var(--plum)] text-white" : CATEGORY_ON[f]) : "text-[var(--ink-soft)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            aria-label="Show one tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowReminders((s) => !s)}
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5"
          >
            🔔 Reminders{futureReminders.length ? ` (${futureReminders.length})` : ""}
          </button>
        </div>
      </div>

      {problem && (
        <p className="admin-warning" role="alert">
          {problem}{" "}
          <button type="button" className="link-button" onClick={() => setProblem("")}>
            Dismiss
          </button>
        </p>
      )}

      {showReminders && (
        <div className="admin-panel">
          <h2 className="text-lg">Reminders still to come</h2>
          {futureReminders.length === 0 ? (
            <p>None. A reminder with a date appears on the board on that day.</p>
          ) : (
            <ul className="grid gap-1">
              {futureReminders
                .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
                .map((t) => (
                  <li key={t.id}>
                    <button type="button" className="link-button" onClick={() => setOpenId(t.id)}>
                      {t.title}
                    </button>{" "}
                    <span className="text-sm text-[var(--ink-soft)]">{formatDue(t.due_date!)}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <AddTask onAdd={add} />

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {COLUMNS.map((col) => {
          const items = sortColumn(visible.filter((t) => t.status === col));
          const style = COLUMN_STYLE[col];
          return (
            <section
              key={col}
              aria-label={COLUMN_LABELS[col]}
              className={`flex min-w-0 flex-col md:order-none md:flex-1 ${PHONE_ORDER[col]}`}
            >
              <h2 className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider ${style.head}`}>
                <span className="text-base">{style.emoji}</span>
                {COLUMN_LABELS[col]}
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs text-white ${style.count}`}>{items.length}</span>
              </h2>
              <div
                {...dropProps(col)}
                className={`grid min-h-[110px] content-start gap-2.5 rounded-2xl p-2 transition-colors ${
                  over === col ? "bg-[var(--pale-heather)]" : "bg-white/50"
                }`}
              >
                {items.map((t) => (
                  <Card
                    key={t.id}
                    task={t}
                    today={today}
                    onOpen={() => setOpenId(t.id)}
                    onChange={(p) => change(t.id, p)}
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
                  />
                ))}
                {items.length === 0 && <p className="py-6 text-center text-xs text-gray-400">No tasks here</p>}
              </div>
            </section>
          );
        })}
      </div>

      <div
        {...dropProps("Done")}
        className={`bottom-3 flex md:sticky items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 py-3 transition-colors ${
          over === "Done" ? "border-emerald-500 bg-emerald-50" : "border-[var(--line)] bg-white/90"
        }`}
      >
        <span className="font-semibold">✅ Drop here when it&apos;s done</span>
        <Link href="/tasks/done">Done ({done})</Link>
      </div>

      {open && (
        <Details
          key={open.id}
          task={open}
          allTags={allTags}
          onClose={() => setOpenId(null)}
          onChange={(p) => change(open.id, p)}
          onDelete={() => remove(open.id)}
          onRenameTag={retag}
        />
      )}
    </div>
  );
}

function AddTask({ onAdd }: { onAdd: (title: string, category: Category, thenOpen: boolean) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Work");
  const [busy, setBusy] = useState(false);

  async function submit(thenOpen: boolean) {
    if (!title.trim() || busy) return;
    setBusy(true);
    await onAdd(title, category, thenOpen);
    setBusy(false);
    setTitle("");
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
    >
      <input
        aria-label="New task"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="min-w-0 flex-[1_1_16rem] rounded-lg border border-[var(--line)] px-3 py-2"
      />
      <div className="flex gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${category === c ? CATEGORY_ON[c] : "bg-gray-100 text-gray-500"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <button type="submit" disabled={!title.trim() || busy} className="btn btn-primary !px-4 !py-2">
        Add
      </button>
      <button type="button" disabled={!title.trim() || busy} onClick={() => submit(true)} className="link-button text-sm">
        Add with details
      </button>
    </form>
  );
}

function Card({
  task,
  today,
  onOpen,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  today: string;
  onOpen: () => void;
  onChange: (p: TaskPatch) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const overdue = isOverdue(task, today);
  const reminder = task.category === "Reminder";
  const latest = task.notes.at(-1);
  const tone = reminder
    ? "border-yellow-200 bg-yellow-50"
    : task.is_priority
      ? "border-red-300 bg-red-50"
      : "border-gray-100 bg-white";

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`relative flex cursor-grab overflow-hidden rounded-xl border shadow-sm hover:shadow-md ${tone}`}
    >
      <div className={`w-1 shrink-0 ${CATEGORY_STRIP[task.category]}`} />
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={onOpen} className="text-left text-[15px] font-semibold leading-snug">
            {task.title}
          </button>
          <div className="flex shrink-0 gap-0.5">
            {!reminder && (
              <button
                type="button"
                onClick={() => onChange({ is_priority: !task.is_priority })}
                title={task.is_priority ? "Remove priority" : "Mark as priority"}
                aria-pressed={task.is_priority}
                className={`rounded-md px-1 ${task.is_priority ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
              >
                ⚑
              </button>
            )}
            <button
              type="button"
              onClick={onOpen}
              title="Notes and details"
              className={`rounded-md px-1 text-sm ${task.notes.length ? "text-violet-600" : "text-gray-300 hover:text-gray-500"}`}
            >
              ✎{task.notes.length ? <span className="ml-0.5 text-[11px]">{task.notes.length}</span> : null}
            </button>
          </div>
        </div>

        {latest && (
          <p className="mt-1.5 line-clamp-2 text-[12px] italic leading-snug text-gray-500">{latest.text}</p>
        )}

        {(task.tag || task.sub_tag || task.due_date) && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {task.tag && (
              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={tagStyle(task.tag)}>
                {task.tag}
              </span>
            )}
            {task.sub_tag && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">{task.sub_tag}</span>
            )}
            {task.due_date && (
              <span
                className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
                  overdue ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {formatDue(task.due_date)}
              </span>
            )}
          </div>
        )}

        {/* Phones can't drag: move buttons instead. */}
        <div className="mt-2.5 flex flex-wrap gap-1.5 md:hidden">
          {COLUMNS.filter((c) => c !== task.status).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ status: c })}
              className="rounded-md bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500"
            >
              {c} ›
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ status: "Done" })}
            className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700"
          >
            Done ✓
          </button>
        </div>
      </div>
    </article>
  );
}

function Details({
  task,
  allTags,
  onClose,
  onChange,
  onDelete,
  onRenameTag,
}: {
  task: Task;
  allTags: string[];
  onClose: () => void;
  onChange: (p: TaskPatch) => void;
  onDelete: () => void;
  onRenameTag: (from: string, to: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);

  const saveText = (field: "tag" | "sub_tag", value: string) => {
    const v = value.trim() || null;
    if (v !== task[field]) onChange({ [field]: v });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={task.title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="grid max-h-[92vh] w-full max-w-xl gap-4 overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        <div className="flex items-start gap-3">
          <textarea
            aria-label="Title"
            value={title}
            rows={2}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title.trim() !== task.title && onChange({ title })}
            className="flex-1 resize-none rounded-lg border border-transparent px-1 text-lg font-semibold hover:border-[var(--line)]"
          />
          <button type="button" onClick={onClose} className="link-button" aria-label="Close">
            Close
          </button>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="font-semibold">Column</span>
            <select
              value={task.status}
              onChange={(e) => onChange({ status: e.target.value as Column })}
              className="rounded-lg border border-[var(--line)] px-2 py-1.5"
            >
              {COLUMNS.map((c) => (
                <option key={c} value={c}>
                  {COLUMN_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Due date</span>
            <input
              type="date"
              value={task.due_date ?? ""}
              onChange={(e) => onChange({ due_date: e.target.value || null })}
              className="rounded-lg border border-[var(--line)] px-2 py-1.5"
            />
          </label>
          <div className="grid gap-1">
            <span className="font-semibold">Category</span>
            <div className="flex gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ category: c })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${task.category === c ? CATEGORY_ON[c] : "bg-gray-100 text-gray-500"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 self-end">
            <input type="checkbox" checked={task.is_priority} onChange={(e) => onChange({ is_priority: e.target.checked })} />
            <span className="font-semibold">Priority</span>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Tag</span>
            <input
              list="task-tags"
              defaultValue={task.tag ?? ""}
              onBlur={(e) => saveText("tag", e.target.value)}
              placeholder="e.g. Dolfach"
              className="rounded-lg border border-[var(--line)] px-2 py-1.5"
            />
            <datalist id="task-tags">
              {allTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Sub-tag</span>
            <input
              defaultValue={task.sub_tag ?? ""}
              onBlur={(e) => saveText("sub_tag", e.target.value)}
              className="rounded-lg border border-[var(--line)] px-2 py-1.5"
            />
          </label>
        </div>

        {task.tag && (
          <div className="text-sm">
            {renaming === null ? (
              <button type="button" className="link-button" onClick={() => setRenaming(task.tag!)}>
                Rename the tag “{task.tag}” on every task
              </button>
            ) : (
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (renaming.trim() && renaming.trim() !== task.tag) onRenameTag(task.tag!, renaming);
                  setRenaming(null);
                }}
              >
                <input
                  aria-label="New tag name"
                  value={renaming}
                  onChange={(e) => setRenaming(e.target.value)}
                  className="rounded-lg border border-[var(--line)] px-2 py-1"
                />
                <button type="submit" className="link-button">Rename</button>
                <button type="button" className="link-button" onClick={() => setRenaming(null)}>
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        <div className="grid gap-2">
          <h3 className="text-base font-semibold">Notes</h3>
          {task.notes.length === 0 && <p className="text-sm text-[var(--ink-soft)]">No notes yet.</p>}
          <ul className="grid gap-2">
            {task.notes.map((n, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-[var(--off-white)] px-3 py-2 text-sm">
                <span className="shrink-0 font-semibold text-[var(--ink-soft)]">{n.date}</span>
                <span className="flex-1 whitespace-pre-wrap">{n.text}</span>
                <button
                  type="button"
                  aria-label="Remove note"
                  title="Remove note"
                  onClick={() => onChange({ notes: task.notes.filter((_, j) => j !== i) })}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              onChange({ notes: [...task.notes, { date: noteDate(), text: note.trim() }] });
              setNote("");
            }}
          >
            <textarea
              aria-label="Add a note"
              placeholder="Add a note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--line)] px-2 py-1.5 text-sm"
            />
            <button type="submit" className="btn btn-secondary !px-3 !py-2 self-end text-sm" disabled={!note.trim()}>
              Add
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
          <button type="button" className="btn btn-primary !px-4 !py-2" onClick={() => onChange({ status: "Done" })}>
            Mark done ✓
          </button>
          {confirming ? (
            <span className="flex items-center gap-3 text-sm">
              Delete for good?
              <button type="button" className="link-button !text-red-700" onClick={onDelete}>
                Yes, delete
              </button>
              <button type="button" className="link-button" onClick={() => setConfirming(false)}>
                Keep it
              </button>
            </span>
          ) : (
            <button type="button" className="link-button text-sm" onClick={() => setConfirming(true)}>
              Delete task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
