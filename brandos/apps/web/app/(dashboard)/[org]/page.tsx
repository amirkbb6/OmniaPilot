import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, Button } from "@brandos/ui";

export default async function OrgDashboard({ params }: { params: { org: string } }) {
  const org = await prisma.org.findUnique({
    where: { slug: params.org },
    include: {
      brandKit: true,
      collections: true,
      entries: true,
      syncJobs: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  });
  if (!org) {
    return <div className="p-10">Organization not found.</div>;
  }
  const productCollection = org.collections.find((c) => c.name === "products");
  const products = org.entries.filter((e) => e.collectionId === productCollection?.id);
  return (
    <div className="space-y-10 p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Puriva BrandOS — {org.name}</h1>
          <p className="text-sm text-neutral-foreground/70">Craft premium commerce experiences with a single source of truth.</p>
        </div>
        <Button asChild>
          <Link href={`/${org.slug}/commerce/catalog`}>Open Commerce</Link>
        </Button>
      </div>
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold">Brand Kit</h2>
          <p className="text-sm text-neutral-foreground/70">Tone: {org.brandKit?.tone ?? "Not set"}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-neutral-foreground/70">{products.length} entries</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Recent Syncs</h2>
          <ul className="mt-2 space-y-1 text-xs text-neutral-foreground/80">
            {org.syncJobs.map((job) => (
              <li key={job.id} className="flex justify-between">
                <span>{job.kind}</span>
                <span>{job.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
