// Called once a day by netlify/functions/daily.mts. Protected by
// CRON_SECRET, so nobody else can trigger it.
import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { DATABASE_CONFIGURED } from "@/lib/supabase/admin";
import { runDaily } from "@/lib/daily";

export const dynamic = "force-dynamic";

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  if (!DATABASE_CONFIGURED) return NextResponse.json({ result: "No database on this deploy." });
  return NextResponse.json({ result: await runDaily() });
}
