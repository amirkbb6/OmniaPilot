import { NextRequest, NextResponse } from "next/server";
import { fetchOrders } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const since = request.nextUrl.searchParams.get("since") ?? undefined;
  const orders = await fetchOrders(orgId, since ?? undefined);
  return NextResponse.json(orders);
}
