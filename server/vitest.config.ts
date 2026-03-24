import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      JWT_SECRET: "vitest-jwt-secret-tests-only",
    },
  },
});
