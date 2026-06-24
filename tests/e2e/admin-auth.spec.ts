import { expect, test } from "@playwright/test";

test("admin routes redirect unauthenticated users", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
});
