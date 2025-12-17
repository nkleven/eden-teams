import { test, expect } from "@playwright/test";

const CONFIG_STORAGE_KEY = "eden-teams-config";

test("loads login page when valid runtime config exists", async ({ page, baseURL }) => {
  // Set localStorage before any app code executes so msalConfig sees it.
  await page.addInitScript(
    ({ key, config }) => {
      window.localStorage.setItem(key, JSON.stringify(config));
    },
    {
      key: CONFIG_STORAGE_KEY,
      config: {
        tenantId: "11111111-1111-1111-1111-111111111111",
        clientId: "22222222-2222-2222-2222-222222222222",
        redirectUri: baseURL,
        apiBase: "",
      },
    }
  );

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Sign in with Microsoft" })).toBeVisible();

  // Ensure config page is not shown.
  await expect(page.getByRole("heading", { name: "Welcome to Eden Teams" })).toHaveCount(0);
});
