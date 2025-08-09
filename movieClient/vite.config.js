import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      // 所有 /api -> 本機 .NET
      "/api": {
        target: "https://localhost:7181", // dev cert OK
        changeOrigin: true,
        secure: false, // 忽略自簽憑證
      },
      "/hubs": {
        target: "https://localhost:7181",
        ws: true,
        secure: false,
      },
      hmr: {
        host: "https://sees-wrote-dubai-suited.trycloudflare.com",
        protocol: "wss",
        clientPort: 443,
      },
    },
  },
});
