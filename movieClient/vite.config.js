import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "https://localhost:7181", // 後端實際位址
=======
        target: "https://localhost:7181/", // 後端實際位址
>>>>>>> 52c569e7ae41cca9a59a21828abaa70cbd4bcf5f
        changeOrigin: true,
        secure: false, // 若是自簽憑證要設 false
      },
    },
  },
<<<<<<< HEAD
});
=======
})
>>>>>>> 52c569e7ae41cca9a59a21828abaa70cbd4bcf5f
