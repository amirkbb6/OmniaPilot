import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const org = request.nextUrl.pathname.split("/")[1];
  const requestHeaders = new Headers(request.headers);
  if (org && org.length > 0) {
    requestHeaders.set("x-org-id", org);
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/:org((?!api|_next|sitemap|robots).*)"]
};
