import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: { LOG_LEVEL: "silent" },
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Process entrypoint only: env expansion and listen() are covered via env.ts and the SSE tests.
      exclude: ["src/server.ts"],
      reporter: ["text-summary", "text", "html"],
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 85 },
    },
  },
});
