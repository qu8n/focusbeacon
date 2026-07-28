import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

/**
 * Two projects rather than one, because the two halves of this app want
 * different globals.
 *
 * Route handlers, middleware and the pure `lib` modules run under `node`:
 * giving them a DOM would let a test pass against browser APIs that do not
 * exist in a serverless function. Everything that renders -- components,
 * hooks, and `lib/export.ts`, which builds an anchor element -- runs under
 * `jsdom`.
 *
 * The env vars are set here rather than in a setup file because `lib/config`
 * reads `process.env` at module load, which happens before any setup hook.
 */
const testEnv = {
  NEXT_PUBLIC_FOCUSBEACON_SITE_URL: "https://focusbeacon.test",
  NEXT_PUBLIC_SESSION_COOKIE_NAME: "sessionId",
  NEXT_PUBLIC_FM_API_URL: "https://api.focusmate.test",
  NEXT_PUBLIC_FM_API_PROFILE_ENDPOINT: "/v1/me",
  NEXT_PUBLIC_FM_API_SESSIONS_ENDPOINT: "/v1/sessions",
  NEXT_PUBLIC_FM_OAUTH_TOKEN_ENDPOINT: "/v1/oauth/token",
  NEXT_PUBLIC_FM_OAUTH_BASE_URL: "https://app.focusmate.test/oauth/authorize",
  NEXT_PUBLIC_FM_OAUTH_CLIENT_ID: "test-client-id",
  NEXT_PUBLIC_FM_OAUTH_SCOPE: "profile sessions",
  FM_OAUTH_CLIENT_SECRET: "test-client-secret",
  ENCRYPTION_KEY:
    "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
  SUPABASE_PROJECT_URL: "https://test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
}

const exclude = ["node_modules/**", ".next/**", "e2e/**"]

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  // tsconfig.json sets "jsx": "preserve" for Next's own compiler, which would
  // otherwise leave esbuild emitting classic `React.createElement` calls
  // against files that never import React
  esbuild: { jsx: "automatic" },
  test: {
    env: testEnv,
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "node",
          environment: "node",
          env: testEnv,
          // A `.ts` test needs no DOM by definition -- anything that renders
          // is `.tsx`. lib/export.ts is the one exception: it builds an
          // anchor element, so its test belongs to the jsdom project below.
          include: ["**/*.test.ts"],
          exclude: [...exclude, "lib/export.test.ts"],
        },
      },
      {
        plugins: [tsconfigPaths(), react()],
        esbuild: { jsx: "automatic" },
        test: {
          name: "dom",
          environment: "jsdom",
          env: testEnv,
          setupFiles: ["./vitest.setup.ts"],
          include: ["**/*.test.tsx", "lib/export.test.ts"],
          exclude,
        },
      },
    ],
  },
})
