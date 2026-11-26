import Link from "next/link";
import { notFound } from "next/navigation";
import { canEdit, requireStaff } from "@/lib/staff";
import { trainerNames } from "@/lib/bespoke";
import BespokeForm from "./BespokeForm";
import { addBespoke } from "./actions";

type Props = { searchParams: Promise<{ notice?: string }> };

export default async function NewBespoke({ searchParams }: Props) {
  const staff = await requireStaff();
  if (!canEdit(staff)) notFound();
  const { notice } = await searchParams;
  const trainers = await trainerNames();
  return (
    <>
      <p><Link href="/admin/planner">← Course planner</Link></p>
      <div className="admin-title">
        <div>
          <h1>Bespoke Booking</h1>
          <p className="form-note">A private course for one organisation. It goes on the planner, not the website.</p>
        </div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      <BespokeForm action={addBespoke} trainers={trainers} submitLabel="Add to planner" />
    </>
  );
}
