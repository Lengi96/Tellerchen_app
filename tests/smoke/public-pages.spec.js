const { test, expect } = require("@playwright/test");

test("landing page loads with primary CTAs and legal links", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("mein-nutrikompass.de").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /14 Tage unverbindlich testen|14 Tage kostenlos testen/i }).first()
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Demo anfordern/i }).first()).toBeVisible();

  await expect(page.getByRole("link", { name: "Impressum" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Datenschutz" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "AGB" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "AVV" }).first()).toBeVisible();
});

test.describe("legal pages", () => {
  const pages = [
    { path: "/impressum", heading: /Impressum/i },
    { path: "/datenschutz", heading: /Datenschutzerkl[aä]rung/i },
    { path: "/agb", heading: /Allgemeine Gesch[aä]ftsbedingungen/i },
    { path: "/avv", heading: /Auftragsverarbeitungsvertrag/i },
  ];

  for (const item of pages) {
    test(`${item.path} renders`, async ({ page }) => {
      const response = await page.goto(item.path);
      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { name: item.heading }).first()).toBeVisible();
    });
  }
});

