import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Pure logic tests only — no DOM, no network. Fast.
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Only report on our own code, not config / types / dependencies.
      include: ["app/**/*.ts", "lib/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.d.ts", "app/layout.tsx", "app/page.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
})
