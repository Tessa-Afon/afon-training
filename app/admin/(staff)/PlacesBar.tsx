import type { Availability } from "@/lib/availability";

// Places booked against capacity, as a bar with the numbers beside it.
export default function PlacesBar({ availability: a }: { availability: Availability }) {
  const capacity = a.capacity ?? 0;
  const booked = a.booked ?? 0;
  const pct = capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 100;
  return (
    <div className="places">
      <div className="places-numbers">
        <span><strong>{booked}</strong> booked</span>
        <span><strong>{a.left ?? 0}</strong> left</span>
        <span>of {capacity}</span>
      </div>
      <div
        className={`places-bar places-bar-${a.state}`}
        role="img"
        aria-label={`${booked} of ${capacity} places booked`}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      {a.closedByAdmin && <p className="form-note">Bookings closed on this card.</p>}
      {!a.closedByAdmin && a.pastCutoff && <p className="form-note">Website bookings closed (2 days before).</p>}
    </div>
  );
}
