import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/wowhead": {
        target: "https://www.wowhead.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/wowhead/, "/search/suggestions-template"),
      },
    },
  },
});