import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("react/")) return "vendor-react";
          if (id.includes("react-router"))  return "vendor-router";
          if (id.includes("@tanstack"))     return "vendor-query";
          if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) return "vendor-form";
          if (id.includes("axios"))         return "vendor-axios";
          return "vendor";
        },
      },
    },
  },
});
