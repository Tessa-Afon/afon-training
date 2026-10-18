import type { Metadata } from "next";
import BrandMark from "@/components/BrandMark";
import GateForm from "./GateForm";

export const metadata: Metadata = { title: "Preview access · Afon Training" };

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;

  return (
    <main className="gate">
      <div className="gate-card">
        <p className="brand">
          <BrandMark />
          Afon Training
        </p>
        <h1>This site is in preview</h1>
        <p className="gate-lede">Enter the preview password to continue.</p>
        <GateForm next={next} />
      </div>
    </main>
  );
}
