import { PrismaClient, EntryStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.org.upsert({
    where: { slug: "puriva" },
    update: {},
    create: {
      name: "Puriva Studio",
      slug: "puriva"
    }
  });

  await prisma.member.upsert({
    where: { userId_orgId: { userId: "seed-user", orgId: org.id } },
    update: {},
    create: {
      user: {
        connectOrCreate: {
          where: { email: "founder@puriva.studio" },
          create: { email: "founder@puriva.studio", name: "Puriva Founder" }
        }
      },
      orgId: org.id,
      role: "OWNER"
    }
  });

  await prisma.brandKit.upsert({
    where: { orgId: org.id },
    update: {
      tone: "Poised, empowering, and precise",
      palette: {
        primary: "#9b87f5",
        secondary: "#f4f0ff",
        accent: "#ff8ba7"
      },
      typography: {
        primary: "Plus Jakarta Sans",
        secondary: "Clash Display"
      },
      tokens: {
        radius: { lg: "20px" },
        shadows: { focus: "0 0 0 2px rgba(155,135,245,0.4)" }
      }
    },
    create: {
      orgId: org.id,
      tone: "Poised, empowering, and precise",
      palette: {
        primary: "#9b87f5",
        secondary: "#f4f0ff",
        accent: "#ff8ba7"
      },
      typography: {
        primary: "Plus Jakarta Sans",
        secondary: "Clash Display"
      },
      tokens: {
        radius: { lg: "20px" },
        shadows: { focus: "0 0 0 2px rgba(155,135,245,0.4)" }
      }
    }
  });

  const products = await prisma.collection.upsert({
    where: { orgId_name: { orgId: org.id, name: "products" } },
    update: {},
    create: {
      orgId: org.id,
      name: "products",
      schema: {
        title: "string",
        body: "richtext",
        price: "number",
        previousPrice: "number",
        images: "string[]"
      }
    }
  });

  await prisma.entry.upsert({
    where: { orgId_slug_collectionId: { orgId: org.id, slug: "leggings-pilates", collectionId: products.id } },
    update: {},
    create: {
      orgId: org.id,
      collectionId: products.id,
      slug: "leggings-pilates",
      status: EntryStatus.DRAFT,
      data: {
        title: "Puriva Flow Leggings",
        body: "<p>High-waist sculpting leggings crafted for pilates grace.</p>",
        price: 89,
        previousPrice: 109,
        images: ["https://images.unsplash.com/photo-1556817411-31ae72fa3ea0"]
      }
    }
  });

  await prisma.page.upsert({
    where: { orgId_path: { orgId: org.id, path: "/" } },
    update: {},
    create: {
      orgId: org.id,
      path: "/",
      blocks: [
        {
          type: "hero",
          heading: "Puriva Studio",
          eyebrow: "BrandOS",
          copy: "Elevate wellness commerce with a single source of truth.",
          cta: { label: "View catalog", href: "/commerce/catalog" }
        }
      ],
      seo: {
        title: "Puriva Studio BrandOS",
        description: "Operate campaigns, assets, and commerce with precision."
      },
      status: EntryStatus.PUBLISHED
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
