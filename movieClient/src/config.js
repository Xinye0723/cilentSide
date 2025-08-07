// 環境配置
const config = {
  // 開發環境
  development: {
    API_BASE_URL: "http://localhost:5276/api",
    FRONTEND_URL: "http://localhost:5173",
    GOOGLE_REDIRECT_URI: "http://localhost:5173/google-callback",
    LINE_REDIRECT_URI: "http://localhost:5173/line-callback",
  },

  // 生產環境 (實機展示)
  production: {
    API_BASE_URL: "http://192.168.1.100:5276/api", // 請替換為實際的 IP 地址
    FRONTEND_URL: "http://192.168.1.100:5173", // 請替換為實際的 IP 地址
    GOOGLE_REDIRECT_URI: "http://192.168.1.100:5173/google-callback", // 請替換為實際的 IP 地址
    LINE_REDIRECT_URI: "http://192.168.1.100:5173/line-callback", // 請替換為實際的 IP 地址
  },
};

// 自動檢測環境
function getCurrentConfig() {
  const hostname = window.location.hostname;
  const port = window.location.port;

  // 如果是 localhost，使用開發環境配置
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return config.development;
  }

  // 否則使用生產環境配置，但動態替換 IP 地址
  const productionConfig = { ...config.production };
  const currentIP = `${hostname}:${port}`;

  // 動態替換 IP 地址
  productionConfig.API_BASE_URL = `http://${hostname}:5276/api`;
  productionConfig.FRONTEND_URL = `http://${currentIP}`;
  productionConfig.GOOGLE_REDIRECT_URI = `http://${currentIP}/google-callback`;
  productionConfig.LINE_REDIRECT_URI = `http://${currentIP}/line-callback`;

  return productionConfig;
}

export const currentConfig = getCurrentConfig();
export default config;
