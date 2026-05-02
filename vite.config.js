import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/bcra": {
        target: "https://api.bcra.gob.ar",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/bcra/, ""),
      },
    },
  },
});
