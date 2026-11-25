// Turns a DoneNow (Base44) Task CSV export into SQL that loads one
// person's open tasks into the task board (supabase/migrations/0003_tasks.sql).
//
//   node scripts/import-donenow.mjs <Task_export.csv> <donenow owner email> <staff email> > import.sql
//
// The CSV holds personal data: keep it and the SQL out of git. The SQL is
// safe to run twice (base44_id is unique), and stops if the staff email
// isn't on the staff list.
import { readFileSync } from "node:fs";

const [csvPath, ownerEmail, staffEmail] = process.argv.slice(2);
if (!csvPath || !ownerEmail || !staffEmail) {
  console.error("Usage: node scripts/import-donenow.mjs <Task_export.csv> <donenow owner email> <staff email>");
  process.exit(1);
}

/** RFC 4180 CSV: quoted fields may hold commas, quotes and new lines. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((f) => f !== ""));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const q = (v) => (v === null || v === undefined || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const STATUSES = ["Inbox", "Today", "This Week", "Waiting", "Later", "Done"];
const CATEGORIES = ["Work", "Personal", "Reminder"];

function notes(raw) {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((n) => n && n.text).map((n) => ({ date: String(n.date ?? ""), text: String(n.text) })) : [];
  } catch {
    return [{ date: "", text: raw }];
  }
}

const tasks = parseCsv(readFileSync(csvPath, "utf8")).filter(
  (t) => t.owner.toLowerCase() === ownerEmail.toLowerCase() && t.is_repeat_template !== "true",
);

const values = tasks.map((t) => {
  const status = STATUSES.includes(t.status) ? t.status : "Inbox";
  const category = CATEGORIES.includes(t.category) ? t.category : "Work";
  const due = /^\d{4}-\d{2}-\d{2}/.test(t.optional_due_date) ? t.optional_due_date.slice(0, 10) : "";
  return `  (${[
    q(t.id),
    q(t.title || "(untitled)"),
    `${q(JSON.stringify(notes(t.notes)))}::jsonb`,
    q(status),
    q(category),
    t.is_priority === "true" ? "true" : "false",
    q(t.tag),
    q(t.sub_tag),
    due ? `${q(due)}::date` : "null",
    status === "Done" ? `${q(t.updated_date || t.created_date)}::timestamptz` : "null",
    `${q(t.created_date || new Date().toISOString())}::timestamptz`,
  ].join(", ")})`;
});

console.log(`-- DoneNow import: ${tasks.length} tasks of ${ownerEmail} for staff ${staffEmail}.
-- Generated ${new Date().toISOString()} by scripts/import-donenow.mjs. Safe to run twice.
do $$
begin
  if (select count(*) from public.staff where lower(email) = lower(${q(staffEmail)})) <> 1 then
    raise exception 'No staff member with the email ${staffEmail.replace(/'/g, "''")}';
  end if;
end $$;

insert into public.tasks
  (base44_id, title, notes, status, category, is_priority, tag, sub_tag, due_date, done_at, created_at, owner_id)
select v.base44_id, v.title, v.notes::jsonb, v.status, v.category, v.is_priority::boolean, v.tag, v.sub_tag,
  v.due_date::date, v.done_at::timestamptz, v.created_at::timestamptz, (select user_id from public.staff where lower(email) = lower(${q(staffEmail)}))
from (values
${values.join(",\n")}
) as v (base44_id, title, notes, status, category, is_priority, tag, sub_tag, due_date, done_at, created_at)
on conflict (base44_id) do nothing;

select count(*) as tasks_on_board from public.tasks
where owner_id = (select user_id from public.staff where lower(email) = lower(${q(staffEmail)}));`);
