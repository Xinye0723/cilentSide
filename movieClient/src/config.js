// ===================== 基本靜態設定 =====================
const config = {
  development: {
    API_BASE_URL: "http://localhost:5276/api",
    FRONTEND_URL: "http://localhost:5173/",
    GOOGLE_REDIRECT_URI: "http://localhost:5173/google-callback",
    LINE_REDIRECT_URI: "http://localhost:5173/line-callback",
  },

  production: {
    // 先放一個預設值，等等會被動態覆蓋
    API_BASE_URL: "http://0.0.0.0:5276/api",
    FRONTEND_URL: "http://0.0.0.0:5173/",
    GOOGLE_REDIRECT_URI: "http://0.0.0.0:5173/google-callback",
    LINE_REDIRECT_URI: "http://0.0.0.0:5173/line-callback",
  },
};

// ===================== 依瀏覽器位置判斷 =====================
function getCurrentConfig() {
  const hostname = window.location.hostname;
  const port = window.location.port; // 5173
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocal) return config.development;

  // ---- 實機 / 局域網情況 ----
  const currentIP = `${hostname}:${port}`; // e.g. 192.168.1.23:5173

  return {
    ...config.production, // 先複製基底
    API_BASE_URL: `http://${hostname}:5276/api`,
    FRONTEND_URL: `http://${currentIP}/`,
    GOOGLE_REDIRECT_URI: `http://${currentIP}/google-callback`,
    LINE_REDIRECT_URI: `http://${currentIP}/line-callback`,
  };
}

export const currentConfig = getCurrentConfig();
export default config;
