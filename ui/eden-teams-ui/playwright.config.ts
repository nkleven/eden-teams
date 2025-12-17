import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 5173);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

const edgeCanaryPath = process.env.EDGE_CANARY_PATH;
const headless = process.env.PW_HEADFUL === "1" ? false : true;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    headless: process.env.CI ? true : headless,
    viewport: { width: 1280, height: 800 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: edgeCanaryPath
      ? {
          executablePath: edgeCanaryPath,
        }
      : undefined,
  },
  // Use Vite dev server for fast iteration.
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: edgeCanaryPath ? "edge-canary" : "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
