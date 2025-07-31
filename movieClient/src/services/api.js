// API 服務
const API_BASE_URL = "http://localhost:5276/api";

// 獲取 Token
function getToken() {
  return localStorage.getItem("token");
}

// 檢查是否已登入
function isAuthenticated() {
  const token = getToken();
  return token !== null && token !== undefined;
}

// 登出
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("memberId");
  localStorage.removeItem("memberName");
}

// 創建帶認證的請求標頭
function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// 通用 API 請求函數
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // 如果回應是 401，表示 Token 過期或無效
    if (response.status === 401) {
      logout();
      window.location.href = "/login";
      return null;
    }

    return response;
  } catch (error) {
    console.error("API 請求失敗:", error);
    throw error;
  }
}

// 會員相關 API
export const memberAPI = {
  // 獲取會員資料
  async getMemberInfo(memberId) {
    const response = await apiRequest(`/Members/${memberId}`);
    if (response && response.ok) {
      return await response.json();
    }
    throw new Error("獲取會員資料失敗");
  },

  // 更新會員資料
  async updateMember(memberId, data) {
    const response = await apiRequest(`/Members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (response && response.ok) {
      return true;
    }
    throw new Error("更新會員資料失敗");
  },
};

// 認證相關
export const auth = {
  isAuthenticated,
  getToken,
  logout,
  getAuthHeaders,
};

export default apiRequest;
