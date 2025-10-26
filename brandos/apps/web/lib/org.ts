import { prisma } from "./db";

export async function ensureOrgAccess(orgSlug: string, userId: string) {
  const org = await prisma.org.findUnique({
    where: { slug: orgSlug },
    include: { members: true }
  });
  if (!org) {
    throw new Error("Org not found");
  }
  const member = org.members.find((m) => m.userId === userId);
  if (!member) {
    throw new Error("Forbidden");
  }
  return { org, member };
}

export function requireRole(role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER", memberRole: string) {
  const order = ["VIEWER", "EDITOR", "ADMIN", "OWNER"];
  return order.indexOf(memberRole) >= order.indexOf(role);
}
