import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
// vueDevTools()
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": {
        target: "https://localhost:7181/",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": { target: "https://localhost:7181", ws: true, secure: false },
      hmr: {
        host: "https://countries-aware-uv-glasgow.trycloudflare.com", // 替換成你那串子網域
        protocol: "wss",
        clientPort: 443,
      },
    },
  },
});
