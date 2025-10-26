import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse("User-agent: *\nAllow: /", { headers: { "Content-Type": "text/plain" } });
}
