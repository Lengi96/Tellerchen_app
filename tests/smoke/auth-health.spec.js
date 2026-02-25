const { test, expect } = require("@playwright/test");

test("login page loads", async ({ page }) => {
  const response = await page.goto("/login");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /anmelden/i })).toBeVisible();
});

test("register page loads", async ({ page }) => {
  const response = await page.goto("/register");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /registrieren|konto erstellen|kostenlos starten/i })).toBeVisible();
});

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  expect(json.status).toBe("ok");
  expect(typeof json.timestamp).toBe("string");
});

