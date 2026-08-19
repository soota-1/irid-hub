import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@irid-hub/shared-types": path.resolve(__dirname, "../../packages/shared-types/api.ts"),
    },
  },
  // Dummy, non-secret values so tests don't depend on a committed .env.test
  // file (apps/web/.gitignore now blanket-ignores .env* — added by `vercel
  // link` — so a checked-in .env.test would silently stop being tracked).
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify("pk_test_dummy-for-unit-tests"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("http://localhost:8080/api/v1"),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    exclude: ["node_modules", "e2e"],
  },
});
