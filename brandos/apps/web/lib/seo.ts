import { Metadata } from "next";
import { prisma } from "./db";

export function buildSeo({
  title,
  description,
  url,
  image
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
}): Metadata {
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i) => i.url)
    }
  };
}

export async function getSitemapEntries(orgId: string) {
  const pages = await prisma.page.findMany({ where: { orgId, status: "PUBLISHED" } });
  return pages.map((page) => ({ url: page.path, lastModified: page.updatedAt ?? page.createdAt }));
}
