import BrandMark from "@/components/BrandMark";

// The small centred card used by the sign-in pages.
export default function AuthCard({ title, lede, children }: { title: string; lede?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="gate">
      <div className="gate-card">
        <p className="brand">
          <BrandMark />
          Afon Training admin
        </p>
        <h1>{title}</h1>
        {lede && <div className="gate-lede">{lede}</div>}
        {children}
      </div>
    </main>
  );
}
