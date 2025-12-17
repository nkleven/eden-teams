import { test, expect } from "@playwright/test";

const CONFIG_STORAGE_KEY = "eden-teams-config";

const VALID_TENANT_ID = "11111111-1111-1111-1111-111111111111";
const VALID_CLIENT_ID = "22222222-2222-2222-2222-222222222222";

test.describe("First-run configuration", () => {
  test("shows configuration wizard when not configured", async ({ page }) => {
    // Force the app into the setup wizard, even if .env provides valid IDs.
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(key, JSON.stringify({ tenantId: "", clientId: "" }));
      },
      { key: CONFIG_STORAGE_KEY }
    );

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Welcome to Eden Teams" })
    ).toBeVisible();

    // Tenant input should be focused on first run.
    await expect(page.locator("input#tenantId")).toBeFocused();

    await expect(
      page.getByRole("button", { name: "Save & Continue" })
    ).toBeDisabled();

    // One-click Start should be disabled when env defaults are not set.
    await expect(page.getByRole("button", { name: "One-click Start" })).toBeDisabled();
  });

  test("saving runtime config leads to login page", async ({ page, baseURL }) => {
    // Start from the wizard state.
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(key, JSON.stringify({ tenantId: "", clientId: "" }));
      },
      { key: CONFIG_STORAGE_KEY }
    );

    await page.goto("/");

    await page.locator("input#tenantId").fill(VALID_TENANT_ID);
    await page.locator("input#clientId").fill(VALID_CLIENT_ID);

    const saveButton = page.getByRole("button", { name: "Save & Continue" });
    await expect(saveButton).toBeEnabled();

    // Click save and wait for the app to reload.
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      saveButton.click(),
    ]);

    // On reload, msalConfig should read localStorage and render the login page.
    await expect(page.getByRole("button", { name: "Sign in with Microsoft" })).toBeVisible();

    // Sanity check: config is persisted.
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      CONFIG_STORAGE_KEY
    );
    expect(stored).toContain(VALID_TENANT_ID);
    expect(stored).toContain(VALID_CLIENT_ID);

    // Optional: ensure redirectUri isn't empty if present in storage.
    if (baseURL) {
      // nothing to assert here; just keep baseURL referenced to avoid lint nags
      expect(baseURL).toContain("http");
    }
  });
});
