import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const reset = await request.post("/api/demo/reset");
  expect(reset.ok()).toBeTruthy();
});

test("dashboard loads the seeded queue", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Good afternoon" })).toBeVisible();
  await expect(page.getByText("SR-1042")).toBeVisible();
  await expect(page.getByText("Connected on port 4174")).toBeVisible();
});

test("request can be filtered and opened", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search requests").fill("diacritics");

  await expect(page.getByText("CSV export drops Romanian diacritics")).toBeVisible();
  await page.getByText("CSV export drops Romanian diacritics").click();
  await expect(page.getByRole("dialog", { name: "CSV export drops Romanian diacritics" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "CSV export drops Romanian diacritics" }).getByText("SR-1039")).toBeVisible();
});

test("request intake validates and creates an item", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New request" }).click();

  const form = page.getByRole("dialog", { name: "Tell the team what happened" });
  await form.getByLabel("Title").fill("Knowledge article link opens the wrong page");
  await form.getByLabel("Description").fill("The billing article card opens an account article after the latest navigation change.");
  await form.getByLabel("Category").selectOption("Documentation");
  await form.getByLabel("Priority").selectOption("Low");
  await form.getByLabel("Your name").fill("Dana Ionescu");
  await form.getByLabel("Email").fill("dana.ionescu@example.test");
  await form.getByRole("button", { name: "Create request" }).click();

  await expect(page.getByRole("dialog", { name: "Knowledge article link opens the wrong page" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Knowledge article link opens the wrong page" }).getByText("Knowledge article link opens the wrong page")).toBeVisible();
});
