import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2)
});

export const updateBrandKitSchema = z.object({
  palette: z.record(z.string(), z.string()),
  typography: z.object({
    primary: z.string(),
    secondary: z.string().optional()
  }),
  tokens: z.record(z.string(), z.any()),
  tone: z.string().optional(),
  logoUrl: z.string().url().optional()
});

export const assetUploadSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  kind: z.enum(["IMAGE", "VIDEO", "FONT", "DOC"]),
  title: z.string(),
  meta: z.record(z.string(), z.any()).default({})
});

export const collectionSchema = z.object({
  name: z.string(),
  schema: z.record(z.string(), z.any())
});

export const entrySchema = z.object({
  collectionId: z.string(),
  slug: z.string(),
  data: z.record(z.string(), z.any()),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT")
});

export const pageSchema = z.object({
  path: z.string(),
  blocks: z.array(z.record(z.string(), z.any())),
  seo: z.record(z.string(), z.any()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT")
});

export const campaignSchema = z.object({
  name: z.string(),
  brief: z.string().optional(),
  channels: z.array(z.string()),
  assets: z.array(z.string()),
  schedule: z.record(z.string(), z.any()).optional(),
  kpis: z.record(z.string(), z.any()).optional(),
  status: z.enum(["PLANNED", "RUNNING", "DONE"]).default("PLANNED")
});

export const shopifyConnectSchema = z.object({
  shopDomain: z.string(),
  accessToken: z.string(),
  storefrontToken: z.string().optional()
});
