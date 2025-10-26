import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("org") ?? "puriva";
  const org = await prisma.org.findUnique({ where: { slug }, include: { pages: true } });
  if (!org) {
    return new NextResponse("", { status: 404 });
  }
  const pages = org.pages.filter((page) => page.status === "PUBLISHED");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
    .map((page) => `\n  <url><loc>${url.origin}/${org.slug}${page.path}</loc><lastmod>${page.updatedAt?.toISOString()}</lastmod></url>`)
    .join("")}
</urlset>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
