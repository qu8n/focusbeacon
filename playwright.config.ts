import { defineConfig, devices } from "@playwright/test"

/**
 * Every spec runs against `?demo=true`, which reads a static fixture in the
 * browser. That means no OAuth, no Supabase and no Python function -- the
 * suite needs nothing but a built Next app, so it runs the same on a
 * contributor's laptop as in CI.
 *
 * Chromium only. These are smoke tests for "does the page render and
 * navigate", and a second engine would double the runtime to re-answer the
 * same question.
 */
const PORT = 3100
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A stray `test.only` should fail the build rather than quietly skip the
  // rest of the suite
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // A production build, not `next dev`: dev-mode compile-on-navigate makes
    // the first visit to each route slow enough to look like a hang
    command: `npm run build && npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_FOCUSBEACON_SITE_URL: BASE_URL,
      NEXT_PUBLIC_SESSION_COOKIE_NAME: "sessionId",
      NEXT_PUBLIC_FM_API_URL: "https://api.focusmate.test",
      NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT: "/v1/me",
      NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT: "/v1/sessions",
      NEXT_PUBLIC_FM_OAUTH_TOKEN_ENDPOINT: "/v1/oauth/token",
      NEXT_PUBLIC_FM_OAUTH_BASE_URL:
        "https://app.focusmate.test/oauth/authorize",
      NEXT_PUBLIC_FM_OAUTH_CLIENT_ID: "test-client-id",
      NEXT_PUBLIC_FM_OAUTH_SCOPE: "profile sessions",
      FM_OAUTH_CLIENT_SECRET: "test-client-secret",
      ENCRYPTION_KEY:
        "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      SUPABASE_PROJECT_URL: "https://test.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    },
  },
})
