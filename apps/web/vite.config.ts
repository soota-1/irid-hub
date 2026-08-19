import { defineConfig } from "vite";
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
  server: {
    port: 5173,
  },
  build: {
    // three.js + @react-three/fiber + drei are inherently heavy; isolated
    // into their own chunk above so only hero/success-moment routes pay
    // for it (Design.md §19 — 3D stays scoped to those two spots).
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
