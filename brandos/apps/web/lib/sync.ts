import { prisma } from "./db";

export async function enqueueSyncJob(orgId: string, direction: "OUT" | "IN", kind: "PRODUCT" | "VARIANT" | "IMAGE" | "ORDER" | "INVENTORY", payload: unknown) {
  return prisma.syncJob.create({
    data: {
      orgId,
      direction,
      kind,
      payload,
      status: "PENDING"
    }
  });
}

export async function resolveSyncJob(id: string, status: "DONE" | "ERROR", error?: string) {
  return prisma.syncJob.update({
    where: { id },
    data: {
      status,
      attempts: { increment: 1 },
      lastError: error
    }
  });
}
