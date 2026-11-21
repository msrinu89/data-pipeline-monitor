import { expect, test } from "@playwright/test";

test("production app loads and exposes failed-run diagnostics without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  // Fonts are optional; CI checks app behavior without relying on Google's CDN.
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Pipeline overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Monitoring metrics" }),
  ).toContainText("Total pipelines");

  await page.getByRole("button", { name: "Review failures" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page
    .getByRole("button", { name: "customer_360_daily", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "customer_360_daily" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Schema validation failed");
  await dialog.getByRole("button", { name: "Logs", exact: true }).click();
  await expect(dialog.locator("pre")).toContainText("SCHEMA_MISMATCH");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile navigation and search work without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pipeline overview" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("button", { name: "Run history", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Run history", level: 1 }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search pipelines or runs" })
    .fill("no-such-pipeline");
  await expect(
    page.getByRole("heading", { name: "No matching runs" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
});
