import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Run against a production build, not `next dev`.
  //
  // The dev server compiles routes on demand and, under parallel workers, can
  // fail a request with `__webpack_modules__[moduleId] is not a function` — a
  // dev-only module-registry race that left the page unhydrated and made the
  // booking-modal test fail in CI. A production build is also what actually
  // ships, so this tests the real artifact.
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      SUPABASE_SECRET_KEY: "test-secret-key",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000"
    }
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
