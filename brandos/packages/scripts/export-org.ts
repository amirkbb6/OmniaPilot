import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: pnpm --filter scripts export <slug>");
    process.exit(1);
  }
  const org = await prisma.org.findUnique({
    where: { slug },
    include: { brandKit: true, collections: true, entries: true, pages: true, campaigns: true }
  });
  console.log(JSON.stringify(org, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect().finally(() => process.exit(1));
  });
