// Bespoke (private) courses for one organisation, kept in the
// bespoke_courses table (supabase/migrations/0005_bespoke_courses.sql).
// Added from the admin Course planner by owner or admin; trainers see the
// ones they are teaching. Never shown on the public website.
import { COURSES } from "./courses";
import { DATABASE_CONFIGURED, db } from "./supabase/admin";

export type Bespoke = {
  id: string;
  organisation: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // "09:30" or ""
  end_time: string;
  trainer: string;
  places: number;
  location: string;
  notes: string;
  created_by: string;
};

const COLUMNS = "id, organisation, title, date, start_time, end_time, trainer, places, location, notes, created_by";

/** Bespoke courses with from <= date < to. Empty (not an error) until the
 *  database and table are set up, so the planner keeps working. */
export async function loadBespoke(from: string, to: string): Promise<Bespoke[]> {
  if (!DATABASE_CONFIGURED) return [];
  const { data, error } = await db()
    .from("bespoke_courses")
    .select(COLUMNS)
    .gte("date", from)
    .lt("date", to)
    .order("date")
    .order("start_time");
  if (error) {
    console.error("Bespoke courses not loaded", error);
    return [];
  }
  return data as Bespoke[];
}

export async function findBespoke(id: string): Promise<Bespoke | null> {
  if (!DATABASE_CONFIGURED || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db().from("bespoke_courses").select(COLUMNS).eq("id", id).maybeSingle();
  return (data as Bespoke | null) ?? null;
}

/** Trainer names for the form: everyone on the staff list with a trainer
 *  name, plus the trainers on the public courses. */
export async function trainerNames(): Promise<string[]> {
  const names = new Set(COURSES.map((c) => c.trainer));
  if (DATABASE_CONFIGURED) {
    const { data } = await db().from("staff").select("trainer_name");
    for (const r of data ?? []) if (r.trainer_name) names.add(r.trainer_name);
  }
  return [...names].sort();
}

export type BespokeInput = Omit<Bespoke, "id" | "created_by">;

/** Checks the form; returns the cleaned values or a message to show. */
export function cleanBespoke(f: FormData): BespokeInput | string {
  const text = (name: string, max = 200) => String(f.get(name) ?? "").trim().slice(0, max);
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  const v: BespokeInput = {
    organisation: text("organisation"),
    title: text("title"),
    date: text("date", 10),
    start_time: text("start-time", 5),
    end_time: text("end-time", 5),
    trainer: text("trainer", 100),
    places: Number(text("places", 6)),
    location: text("location", 300),
    notes: text("notes", 2000),
  };
  if (!v.organisation) return "Please enter the organisation.";
  if (!v.title) return "Please enter the course.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return "Please enter the date.";
  if ((v.start_time && !time.test(v.start_time)) || (v.end_time && !time.test(v.end_time)))
    return "Please enter times like 09:30.";
  if (v.start_time && v.end_time && v.end_time <= v.start_time) return "The finish time must be after the start time.";
  if (!v.trainer) return "Please choose the trainer.";
  if (!Number.isInteger(v.places) || v.places < 1 || v.places > 500) return "Please enter the number of places.";
  return v;
}
