import type { Bespoke } from "@/lib/bespoke";

type Props = {
  action: (form: FormData) => Promise<void>;
  trainers: string[];
  values?: Bespoke;
  submitLabel: string;
};

type FieldProps = {
  id: string;
  label: string;
  /** Shown after the label in lighter text, e.g. "optional". */
  hint?: string;
  value?: string | number | null;
  type?: string;
  required?: boolean;
  rows?: number;
  min?: number;
  step?: string;
  autoComplete?: string;
};

function Field(p: FieldProps) {
  const id = `bespoke-${p.id}`;
  const value = p.value ?? undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {p.label}
        {p.required && <> <span className="required" aria-hidden="true">*</span></>}
        {p.hint && <> <span className="optional">({p.hint})</span></>}
      </label>
      {p.rows ? (
        <textarea id={id} name={p.id} rows={p.rows} defaultValue={value} required={p.required} autoComplete={p.autoComplete} />
      ) : (
        <input
          id={id}
          name={p.id}
          type={p.type ?? "text"}
          defaultValue={value}
          required={p.required}
          min={p.min}
          step={p.step}
          autoComplete={p.autoComplete}
        />
      )}
    </div>
  );
}

/** Add or change a bespoke course (owner and admin only). */
export default function BespokeForm({ action, trainers, values: v, submitLabel }: Props) {
  return (
    <form action={action} className="site-form admin-panel">
      <fieldset>
        <legend>Course</legend>
        <div className="field-row">
          <Field id="organisation" label="Practice or organisation" value={v?.organisation} required autoComplete="off" />
          <Field id="title" label="Course" value={v?.title} required autoComplete="off" />
        </div>
        <div className="field-row">
          <Field id="date" label="Date" type="date" value={v?.date} required />
          <Field id="start-time" label="Start time" hint="optional" type="time" value={v?.start_time} />
          <Field id="end-time" label="Finish time" hint="optional" type="time" value={v?.end_time} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="bespoke-trainer">
              Trainer <span className="required" aria-hidden="true">*</span>
            </label>
            <select id="bespoke-trainer" name="trainer" defaultValue={v?.trainer ?? trainers[0]} required>
              {[...new Set([...(v ? [v.trainer] : []), ...trainers])].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <Field id="places" label="Places" type="number" min={1} value={v?.places ?? 1} required />
          <Field id="price" label="Agreed price, £" hint="optional, whole course" type="number" min={0} step="0.01" value={v?.price} />
        </div>
        <Field id="location" label="Where" hint="optional: onsite address or Microsoft Teams" value={v?.location} />
      </fieldset>

      <fieldset>
        <legend>Booking contact</legend>
        <div className="field-row">
          <Field id="contact-name" label="Name" hint="optional" value={v?.contact_name} autoComplete="off" />
          <Field id="email" label="Email" hint="optional" type="email" value={v?.email} autoComplete="off" />
          <Field id="phone" label="Telephone" hint="optional" type="tel" value={v?.phone} autoComplete="off" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Invoice details</legend>
        <Field id="invoice-address" label="Invoice address" hint="optional" rows={3} value={v?.invoice_address} autoComplete="off" />
        <div className="field-row">
          <Field
            id="invoice-email"
            label="Send the invoice to"
            hint="optional, if not the email above"
            type="email"
            value={v?.invoice_email}
            autoComplete="off"
          />
          <Field id="po-number" label="Purchase order number" hint="optional" value={v?.po_number} autoComplete="off" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Attendees and notes</legend>
        <Field id="attendees" label="Attendee names and email addresses, one per line" hint="optional" rows={4} value={v?.attendees} />
        <Field id="notes" label="Notes" hint="optional" rows={3} value={v?.notes} />
      </fieldset>

      <p className="form-note">
        Bespoke courses show on the planner only. They are not shown on the website, and nothing is emailed or invoiced
        automatically.
      </p>
      <div className="actions">
        <button className="btn btn-primary btn-small" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
