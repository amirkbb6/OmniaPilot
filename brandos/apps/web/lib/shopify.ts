import { Entry, Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "./db";
import { hashPayload } from "./security";

const adminVersion = "2024-01";

function getShopConfig(orgId: string) {
  return prisma.shopifyShop.findUnique({ where: { orgId } });
}

function createHeaders(token: string) {
  return {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json"
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBackoff<T>(fn: () => Promise<T>, attempts = 0): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts >= 4) throw error;
    await sleep(2 ** attempts * 200);
    return withBackoff(fn, attempts + 1);
  }
}

export async function verifyWebhookHmac(header: string | undefined, rawBody: string, secret: string) {
  if (!header) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(header));
}

export async function upsertProduct(orgId: string, entry: Entry) {
  const shop = await getShopConfig(orgId);
  if (!shop) throw new Error("Shopify not connected");

  const productPayload = buildProductPayload(entry);
  const payloadHash = hashPayload(productPayload);
  const map = await prisma.shopifyProductMap.findUnique({ where: { orgId_entryId: { orgId, entryId: entry.id } } });

  const request = async () => {
    const endpoint = map
      ? `https://${shop.shopDomain}/admin/api/${adminVersion}/products/${map.shopifyProductId}.json`
      : `https://${shop.shopDomain}/admin/api/${adminVersion}/products.json`;
    const method = map ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: createHeaders(shop.accessToken),
      body: JSON.stringify({ product: productPayload })
    });
    if (res.status === 429) throw new Error("Rate limited");
    if (!res.ok) {
      throw new Error(`Shopify error ${res.status}`);
    }
    const body = await res.json();
    const product = body.product;
    await prisma.$transaction([
      prisma.shopifyProductMap.upsert({
        where: { orgId_entryId: { orgId, entryId: entry.id } },
        create: { orgId, entryId: entry.id, shopifyProductId: product.id.toString() },
        update: { shopifyProductId: product.id.toString() }
      }),
      prisma.auditLog.create({
        data: {
          orgId,
          action: "SHOPIFY_PRODUCT_SYNC",
          target: product.id.toString(),
          meta: {
            entryId: entry.id,
            payloadHash
          }
        }
      })
    ]);
    return product;
  };

  return withBackoff(request);
}

function buildProductPayload(entry: Entry) {
  const data = (entry.data as Prisma.JsonObject) ?? {};
  const title = (data["title"] as string) ?? entry.slug;
  const bodyHtml = (data["body"] as string) ?? "";
  const price = (data["price"] as string | number | undefined) ?? "0";
  const previousPrice = data["previousPrice"] as string | number | undefined;
  const images = ((data["images"] as Prisma.JsonArray) ?? []).map((url) => ({ src: url }));
  return {
    title,
    body_html: bodyHtml,
    status: entry.status === "PUBLISHED" ? "active" : "draft",
    variants: [
      {
        price: price,
        compare_at_price: previousPrice
      }
    ],
    images
  };
}

export async function uploadProductImages(orgId: string, entryId: string, urls: string[]) {
  const shop = await getShopConfig(orgId);
  if (!shop) throw new Error("Shopify not connected");
  const map = await prisma.shopifyProductMap.findUnique({ where: { orgId_entryId: { orgId, entryId } } });
  if (!map) throw new Error("Product not synced");

  return withBackoff(async () => {
    const res = await fetch(
      `https://${shop.shopDomain}/admin/api/${adminVersion}/products/${map.shopifyProductId}/images.json`,
      {
        method: "POST",
        headers: createHeaders(shop.accessToken),
        body: JSON.stringify({ images: urls.map((url) => ({ src: url })) })
      }
    );
    if (!res.ok) throw new Error(`Image upload failed ${res.status}`);
    const body = await res.json();
    await prisma.auditLog.create({
      data: {
        orgId,
        action: "SHOPIFY_IMAGE_UPLOAD",
        target: map.shopifyProductId,
        meta: { urls, response: body }
      }
    });
    return body.images;
  });
}

export async function fetchOrders(orgId: string, since?: string) {
  const shop = await getShopConfig(orgId);
  if (!shop) throw new Error("Shopify not connected");
  const url = new URL(`https://${shop.shopDomain}/admin/api/${adminVersion}/orders.json`);
  url.searchParams.set("status", "any");
  if (since) url.searchParams.set("created_at_min", since);

  return withBackoff(async () => {
    const res = await fetch(url.toString(), { headers: createHeaders(shop.accessToken) });
    if (!res.ok) throw new Error(`Orders fetch failed ${res.status}`);
    const json = await res.json();
    await prisma.auditLog.create({
      data: {
        orgId,
        action: "SHOPIFY_ORDERS_FETCH",
        target: "orders",
        meta: { since, count: json.orders?.length ?? 0 }
      }
    });
    return json.orders;
  });
}

export async function fetchInventoryLevels(orgId: string, productId?: string) {
  const shop = await getShopConfig(orgId);
  if (!shop) throw new Error("Shopify not connected");
  const url = new URL(`https://${shop.shopDomain}/admin/api/${adminVersion}/inventory_levels.json`);
  if (productId) url.searchParams.set("inventory_item_ids", productId);

  return withBackoff(async () => {
    const res = await fetch(url.toString(), { headers: createHeaders(shop.accessToken) });
    if (!res.ok) throw new Error(`Inventory fetch failed ${res.status}`);
    const json = await res.json();
    await prisma.auditLog.create({
      data: {
        orgId,
        action: "SHOPIFY_INVENTORY_FETCH",
        target: "inventory",
        meta: { productId, count: json.inventory_levels?.length ?? 0 }
      }
    });
    return json.inventory_levels;
  });
}

export const __TEST__ = { buildProductPayload };
