import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/bcra-api": {
        target: "https://api.bcra.gob.ar",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bcra-api/, ""),
      },
    },
  },
});
