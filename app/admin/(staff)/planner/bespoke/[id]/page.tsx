import Link from "next/link";
import { notFound } from "next/navigation";
import { canEdit, requireStaff } from "@/lib/staff";
import { findBespoke, trainerNames } from "@/lib/bespoke";
import BespokeForm from "../BespokeForm";
import { deleteBespoke, updateBespoke } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> };

export default async function EditBespoke({ params, searchParams }: Props) {
  const staff = await requireStaff();
  if (!canEdit(staff)) notFound();
  const { id } = await params;
  const { notice } = await searchParams;
  const [bespoke, trainers] = await Promise.all([findBespoke(id), trainerNames()]);
  if (!bespoke) notFound();
  return (
    <>
      <p><Link href={`/admin/planner?from=${bespoke.date.slice(0, 7)}`}>← Course planner</Link></p>
      <div className="admin-title">
        <div>
          <h1>{bespoke.title}</h1>
          <p className="form-note">
            Bespoke course for {bespoke.organisation}
            {bespoke.created_by && `, added by ${bespoke.created_by}`}.
          </p>
        </div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      <BespokeForm action={updateBespoke.bind(null, id)} trainers={trainers} values={bespoke} submitLabel="Save changes" />
      <details className="admin-panel">
        <summary>Delete this bespoke course</summary>
        <form action={deleteBespoke.bind(null, id)} className="site-form">
          <p className="form-note">This removes it from the planner. It can&apos;t be undone.</p>
          <div className="actions">
            <button className="btn btn-secondary btn-small btn-danger" type="submit">Delete</button>
          </div>
        </form>
      </details>
    </>
  );
}
