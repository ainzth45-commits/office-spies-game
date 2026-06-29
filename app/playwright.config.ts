import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev -- --port 4175",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:4175",
    viewport: { width: 1180, height: 820 },
  },
  projects: [
    {
      name: "ipad-landscape",
      use: { ...devices["Desktop Safari"], viewport: { width: 1180, height: 820 } },
    },
  ],
});
