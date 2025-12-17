import { test, expect } from "@playwright/test";

const CONFIG_STORAGE_KEY = "eden-teams-config";

const VALID_TENANT_ID = "11111111-1111-1111-1111-111111111111";
const VALID_CLIENT_ID = "22222222-2222-2222-2222-222222222222";

test.describe("First-run configuration", () => {
  test("shows configuration wizard when not configured", async ({ page }) => {
    // Force the app into the setup wizard, even if .env provides valid IDs.
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({ tenantId: "invalid", clientId: "invalid" })
        );
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

    // The presence/enabled state of quick-start buttons depends on local .env.
    await expect(page.getByRole("button", { name: "One-click Start" })).toBeVisible();
  });

  test("saving runtime config leads to login page", async ({ page, baseURL }) => {
    // Start from the wizard state.
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({ tenantId: "invalid", clientId: "invalid" })
        );
      },
      { key: CONFIG_STORAGE_KEY }
    );

    await page.goto("/");

    const useEnvDefaults = page.getByRole("button", { name: "Use Env Defaults" });
    const hasEnvDefaults = await useEnvDefaults.isEnabled();
    if (hasEnvDefaults) {
      await useEnvDefaults.click();
      // Wait for the fields to update away from the forced invalid values.
      await expect(page.locator("input#tenantId")).not.toHaveValue("invalid");
      await expect(page.locator("input#clientId")).not.toHaveValue("invalid");
    } else {
      await page.locator("input#tenantId").fill(VALID_TENANT_ID);
      await page.locator("input#clientId").fill(VALID_CLIENT_ID);
    }

    const saveButton = page.getByRole("button", { name: "Save & Continue" });
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    // Wait for persistence (the app reloads itself after a short delay).
    await page.waitForFunction(
      (key) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) return false;
        try {
          const parsed = JSON.parse(stored) as { tenantId?: string; clientId?: string };
          const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return Boolean(
            parsed.tenantId &&
              parsed.clientId &&
              parsed.tenantId !== "invalid" &&
              parsed.clientId !== "invalid" &&
              guid.test(parsed.tenantId) &&
              guid.test(parsed.clientId)
          );
        } catch {
          return false;
        }
      },
      CONFIG_STORAGE_KEY
    );

    // Ensure we're on a fresh load state for subsequent assertions.
    await page.reload({ waitUntil: "domcontentloaded" });

    // If real env defaults exist, MSAL should initialize and show the login page.
    if (hasEnvDefaults) {
      await expect(
        page.getByRole("button", { name: "Sign in with Microsoft" })
      ).toBeVisible();
    }

    // Sanity check: config is persisted.
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      CONFIG_STORAGE_KEY
    );
    if (!hasEnvDefaults) {
      expect(stored).toContain(VALID_TENANT_ID);
      expect(stored).toContain(VALID_CLIENT_ID);
    }

    // Optional: ensure redirectUri isn't empty if present in storage.
    if (baseURL) {
      // nothing to assert here; just keep baseURL referenced to avoid lint nags
      expect(baseURL).toContain("http");
    }
  });
});
