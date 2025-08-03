// API 服務
const API_BASE_URL = "https://localhost:7181/api";

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
  // 獲取會員資料（需要認證）
  async getMemberInfo(memberId) {
    const response = await apiRequest(`/Members/${memberId}`);
    if (response && response.ok) {
      return await response.json();
    }
    throw new Error("獲取會員資料失敗");
  },

  // 獲取會員資料（不需要認證，測試用）
  async getMemberInfoPublic(memberId) {
    const url = `${API_BASE_URL}/Members/public/${memberId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url, config);
      if (response && response.ok) {
        return await response.json();
      }
      throw new Error("獲取會員資料失敗");
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw error;
    }
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

// 訂單相關 API
export const orderAPI = {
  // 獲取會員觀影紀錄（需要認證）
  async getMemberOrderHistory(memberId) {
    const response = await apiRequest(`/Order/member/${memberId}/history`);
    if (response && response.ok) {
      return await response.json();
    }
    throw new Error("獲取觀影紀錄失敗");
  },

  // 獲取會員觀影紀錄（不需要認證，測試用）
  async getMemberOrderHistoryPublic(memberId) {
    const url = `${API_BASE_URL}/Order/member/${memberId}/history/public`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url, config);
      if (response && response.ok) {
        return await response.json();
      }
      throw new Error("獲取觀影紀錄失敗");
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw error;
    }
  },

  // 獲取會員統計資料（需要認證）
  async getMemberStatistics(memberId) {
    const response = await apiRequest(`/Order/member/${memberId}/statistics`);
    if (response && response.ok) {
      return await response.json();
    }
    throw new Error("獲取統計資料失敗");
  },

  // 獲取會員統計資料（不需要認證，測試用）
  async getMemberStatisticsPublic(memberId) {
    const url = `${API_BASE_URL}/Order/member/${memberId}/statistics/public`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url, config);
      if (response && response.ok) {
        return await response.json();
      }
      throw new Error("獲取統計資料失敗");
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw error;
    }
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
