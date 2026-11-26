import type { Bespoke } from "@/lib/bespoke";

type Props = {
  action: (form: FormData) => Promise<void>;
  trainers: string[];
  values?: Bespoke;
  submitLabel: string;
};

function Field(props: { id: string; label: string; value?: string | number; type?: string; required?: boolean; rows?: number; narrow?: boolean; min?: number }) {
  return (
    <div className={`field${props.narrow ? " field-narrow" : ""}`}>
      <label htmlFor={`bespoke-${props.id}`}>{props.label}</label>
      {props.rows ? (
        <textarea id={`bespoke-${props.id}`} name={props.id} rows={props.rows} defaultValue={props.value} />
      ) : (
        <input
          id={`bespoke-${props.id}`}
          name={props.id}
          type={props.type ?? "text"}
          defaultValue={props.value}
          required={props.required}
          min={props.min}
        />
      )}
    </div>
  );
}

/** Add or change a bespoke course (owner and admin only). */
export default function BespokeForm({ action, trainers, values: v, submitLabel }: Props) {
  return (
    <form action={action} className="site-form admin-panel">
      <div className="field-row">
        <Field id="organisation" label="Organisation" value={v?.organisation} required />
        <Field id="title" label="Course" value={v?.title} required />
      </div>
      <div className="field-row">
        <Field id="date" label="Date" type="date" value={v?.date} required />
        <Field id="start-time" label="Start time (optional)" type="time" value={v?.start_time} />
        <Field id="end-time" label="Finish time (optional)" type="time" value={v?.end_time} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="bespoke-trainer">Trainer</label>
          <select id="bespoke-trainer" name="trainer" defaultValue={v?.trainer ?? trainers[0]} required>
            {[...new Set([...(v ? [v.trainer] : []), ...trainers])].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <Field id="places" label="Places" type="number" min={1} value={v?.places ?? 1} required />
      </div>
      <Field id="location" label="Where (optional): onsite address or Microsoft Teams" value={v?.location} />
      <Field id="notes" label="Notes (optional)" value={v?.notes} rows={4} />
      <p className="form-note">Bespoke courses show on the planner only. They are not shown on the website.</p>
      <div className="actions">
        <button className="btn btn-primary btn-small" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
