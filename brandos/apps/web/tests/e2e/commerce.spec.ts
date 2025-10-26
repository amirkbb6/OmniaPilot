import { test, expect } from "@playwright/test";

test.describe("Puriva commerce", () => {
  test("dashboard renders", async ({ page }) => {
    await page.goto("/puriva");
    await expect(page.getByText("Puriva BrandOS")).toBeVisible();
  });
});
