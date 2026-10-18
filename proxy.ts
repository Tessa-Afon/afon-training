import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, IS_LIVE, gateToken } from "./lib/site-gate";

export async function proxy(request: NextRequest) {
  if (IS_LIVE) return NextResponse.next();

  const password = process.env.SITE_PASSWORD;

  // No password configured: open locally, closed everywhere else.
  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Site password not configured.", { status: 503 });
  }

  const cookie = request.cookies.get(GATE_COOKIE)?.value;
  if (cookie && cookie === (await gateToken(password))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  url.search = "";
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!gate|__forms\\.html|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
