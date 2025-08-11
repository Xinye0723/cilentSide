<script setup lang="ts">
import { ref, onMounted, onActivated, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { memberAPI, orderAPI } from "../services/api.js";

const auth = useAuthStore();
const { memberId } = storeToRefs(auth);
const isLoggedIn = computed(() => (auth as any).isLoggedIn);
const router = useRouter();
const drawCount = ref(0);
const loadDrawCount = async () => {
  const memberIdValue = memberId.value;
  try {
    const response = await fetch(
      `https://localhost:7181/api/Draw/member/${memberIdValue}/count`
    );
    if (response.ok) {
      const data = await response.json();
      drawCount.value = data.drawCount; // 資料庫的抽籤次數
    } else {
      drawCount.value = 0;
    }
  } catch (error) {
    console.error("獲取抽籤次數錯誤:", error);
    drawCount.value = 0;
  }
};
// 會員基本資訊
const memberInfo = ref({
  name: "",
  email: "",
  phone: "",
  memberId: "",
  joinDate: "",
  level: "",
  points: 0,
  memberImg: "",
});

// 觀影紀錄
const viewingHistory = ref([]);

// 統計資料
const statistics = ref({
  totalMovies: 0,
  totalSpent: 0,
  favoriteGenre: "",
  averageRating: 0,
});

// 載入狀態
const loading = ref(true);
const error = ref("");

// 獲取會員資料
const loadMemberData = async () => {
  try {
    loading.value = true;
    error.value = "";

    // 從 auth store 獲取會員 ID
    const memberIdValue = memberId.value;
    console.log("開始載入會員資料，會員ID:", memberIdValue);

    if (!memberIdValue || !isLoggedIn.value) {
      error.value = "未找到會員資訊，請重新登入";
      router.push("/login");
      return;
    }

    // 獲取會員基本資訊（先使用不需要認證的 API 測試）
    console.log("嘗試獲取會員基本資訊...");
    const memberData = await memberAPI.getMemberInfoPublic(
      parseInt(memberIdValue)
    );
    console.log("會員資料:", memberData); // 調試用

    // 獲取統計資料（使用不需要認證的 API）
    try {
      console.log("嘗試獲取統計資料...");
      const statsData = await orderAPI.getMemberStatisticsPublic(
        parseInt(memberIdValue)
      );
      console.log("統計資料:", statsData);

      statistics.value = {
        totalMovies: statsData.totalMovies || 0,
        totalSpent: statsData.totalSpent || 0,
        favoriteGenre: statsData.favoriteGenre || "無資料",
        averageRating: statsData.averageRating || 0,
      };

      // 計算抽籤次數（每500元就有一次抽獎機會）
      const totalSpent = statsData.totalSpent || 0;
      const drawCount = Math.floor(totalSpent / 500);

      // 計算會員等級
      let memberLevel = "";
      if (totalSpent >= 5000) {
        memberLevel = "鉑金會員";
      } else if (totalSpent >= 3000) {
        memberLevel = "銀卡會員";
      } else if (totalSpent >= 1000) {
        memberLevel = "銀卡會員";
      } else {
        memberLevel = "一般會員";
      }

      // 從資料庫讀取抽籤次數，如果沒有則使用計算值
      let lotteryPoints = parseInt(memberData.memberPoint);
      if (isNaN(lotteryPoints) || lotteryPoints < 0) {
        lotteryPoints = drawCount;
      }

      memberInfo.value = {
        name: memberData.memberName || "未知",
        email: memberData.memberEmail || "",
        phone: memberData.memberPhone || "",
        memberId: memberData.memberId?.toString() || "",
        joinDate: "2023-01-15", // 假設加入日期，實際可以從資料庫獲取
        level: memberLevel,
        points: lotteryPoints,
        memberImg: memberData.memberImg
          ? `https://localhost:7181${memberData.memberImg}`
          : "",
      };
    } catch (statsErr) {
      console.error("載入統計資料失敗:", statsErr);
      // 如果統計資料載入失敗，使用預設值
      memberInfo.value = {
        name: memberData.memberName || "未知",
        email: memberData.memberEmail || "",
        phone: memberData.memberPhone || "",
        memberId: memberData.memberId?.toString() || "",
        joinDate: "2023-01-15",
        level: "一般會員",
        points: 0,
        memberImg: memberData.memberImg
          ? `https://localhost:7181${memberData.memberImg}`
          : "",
      };
    }

    // 獲取觀影紀錄（使用不需要認證的 API）
    try {
      console.log("嘗試獲取觀影紀錄...");
      const orderHistory = await orderAPI.getMemberOrderHistoryPublic(
        parseInt(memberIdValue)
      );
      console.log("觀影紀錄:", orderHistory);

      viewingHistory.value = orderHistory.map((record, index) => ({
        id: record.orderId,
        movieName: record.movieName,
        date: record.date,
        time: record.time,
        theater: record.theater,
        seat: record.seat,
        ticketType: record.ticketType,
        ticketCount: record.ticketCount || 1,
        price: record.price,
        snackInfo: record.snackInfo,
      }));
    } catch (err) {
      console.error("載入觀影紀錄失敗:", err);
      // 如果觀影紀錄載入失敗，嘗試使用簡化版本的 API
      try {
        console.log("嘗試使用簡化版本的觀影紀錄 API...");
        const response = await fetch(
          `https://localhost:7181/api/Order/member/${memberIdValue}/history/simple`
        );
        if (response.ok) {
          const simpleOrderHistory = await response.json();
          console.log("簡化觀影紀錄:", simpleOrderHistory);

          viewingHistory.value = simpleOrderHistory.map((record, index) => ({
            id: record.orderId,
            movieName: record.movieName,
            date: record.date,
            time: record.time,
            theater: record.theater,
            seat: record.seat,
            ticketType: record.ticketType,
            ticketCount: record.ticketCount || 1,
            price: record.price,
            snackInfo: record.snackInfo,
          }));
        } else {
          throw new Error("簡化 API 也失敗");
        }
      } catch (simpleErr) {
        console.error("簡化觀影紀錄也失敗:", simpleErr);
        // 如果簡化版本也失敗，使用基本版本
        try {
          console.log("嘗試使用基本版本的觀影紀錄 API...");
          const response = await fetch(
            `https://localhost:7181/api/Order/member/${memberIdValue}/history/basic`
          );
          if (response.ok) {
            const basicOrderHistory = await response.json();
            console.log("基本觀影紀錄:", basicOrderHistory);

            viewingHistory.value = basicOrderHistory.map((record, index) => ({
              id: record.orderId,
              movieName: record.movieName,
              date: record.date,
              time: record.time,
              theater: record.theater,
              seat: record.seat,
              ticketType: record.ticketType,
              ticketCount: record.ticketCount || 1,
              price: record.price,
              snackInfo: record.snackInfo,
            }));
          } else {
            throw new Error("基本 API 也失敗");
          }
        } catch (basicErr) {
          console.error("基本觀影紀錄也失敗:", basicErr);
          // 如果所有 API 都失敗，顯示預設資料
          viewingHistory.value = [
            {
              id: 1,
              movieName: "測試電影",
              date: "2024-01-01",
              time: "14:00",
              theater: "第1廳",
              seat: "A1",
              ticketType: "一般票",
              ticketCount: 1,
              price: 900,
            },
          ];
        }
      }
    }
  } catch (err) {
    console.error("載入會員資料失敗:", err);
    error.value = "載入資料失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadMemberData();
  loadDrawCount();
});

// 當組件被激活時（從其他頁面返回時）重新載入資料
onActivated(() => {
  loadMemberData();
});

// 測試 API 連接
const testAPI = async () => {
  try {
    console.log("開始測試 API 連接...");

    // 測試基本 API 連接
    const response = await fetch(
      "https://localhost:7181/api/Members/debug/all"
    );
    console.log("API 測試回應狀態:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("API 測試成功:", data);
      alert(`API 連接成功！找到 ${data.totalMembers} 個會員`);
    } else {
      console.error("API 測試失敗:", response.status);
      alert(`API 連接失敗！狀態碼: ${response.status}`);
    }
  } catch (error) {
    console.error("API 測試錯誤:", error);
    alert("API 測試錯誤: " + error.message);
  }
};

// 測試觀影紀錄 API
const testOrderHistory = async () => {
  try {
    const memberIdValue = memberId.value;
    if (!memberIdValue) {
      alert("請先登入");
      return;
    }

    console.log("開始測試觀影紀錄 API...");

    // 測試不同的 API 端點
    const endpoints = [
      `/api/Order/member/${memberIdValue}/history/public`,
      `/api/Order/member/${memberIdValue}/history/simple`,
      `/api/Order/member/${memberIdValue}/history/basic`,
      `/api/Order/test/join/${memberIdValue}`,
      `/api/Order/debug/member/${memberIdValue}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`https://localhost:7181${endpoint}`);
        console.log(`測試 ${endpoint}:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`${endpoint} 成功:`, data);
        } else {
          console.error(`${endpoint} 失敗:`, response.status);
        }
      } catch (error) {
        console.error(`${endpoint} 錯誤:`, error);
      }
    }

    alert("觀影紀錄 API 測試完成，請查看控制台");
  } catch (error) {
    console.error("觀影紀錄 API 測試錯誤:", error);
    alert("觀影紀錄 API 測試錯誤: " + error.message);
  }
};

// 跳轉到抽籤遊戲
const goToLottery = () => {
  router.push("/lotteryGame");
};
</script>

<template>
  <div class="member-inform-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">會員資料</h1>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>
      <button @click="loadMemberData" class="retry-button">重新載入</button>
      <button @click="testAPI" class="retry-button" style="margin-left: 10px">
        測試 API
      </button>
      <button
        @click="testOrderHistory"
        class="retry-button"
        style="margin-left: 10px"
      >
        測試觀影紀錄
      </button>
    </div>

    <!-- 主要內容 -->
    <div v-else class="content-wrapper">
      <!-- 會員基本資訊區塊 -->
      <div class="info-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">👤</span>
            基本資訊
          </h2>
        </div>

        <div class="member-card">
          <div class="member-avatar">
            <img
              v-if="memberInfo.memberImg"
              :src="memberInfo.memberImg"
              alt="Member Avatar"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ memberInfo.name.charAt(0) }}
            </div>
          </div>

          <div class="member-details">
            <div class="detail-row">
              <span class="label">姓名：</span>
              <span class="value">{{ memberInfo.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">會員編號：</span>
              <span class="value">{{ memberInfo.memberId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">電子郵件：</span>
              <span class="value">{{ memberInfo.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">聯絡電話：</span>
              <span class="value">{{ memberInfo.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">加入日期：</span>
              <span class="value">{{ memberInfo.joinDate }}</span>
            </div>
            <div class="detail-row">
              <span class="label">會員等級：</span>
              <span class="value member-level">{{ memberInfo.level }}</span>
            </div>
            <div class="detail-row">
              <span class="label">抽籤次數：</span>
              <span class="value points">{{ drawCount }} 次</span>
              <button @click="goToLottery" class="lottery-btn">扭蛋遊戲</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 觀影統計區塊 -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">📊</span>
            觀影統計
          </h2>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎬</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalMovies }}</div>
              <div class="stat-label">訂單次數</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-number">${{ statistics.totalSpent }}</div>
              <div class="stat-label">總消費</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎭</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.favoriteGenre }}</div>
              <div class="stat-label">最愛類型</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.averageRating }}</div>
              <div class="stat-label">平均評分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 觀影紀錄區塊 -->
      <div class="history-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">🎫</span>
            觀影紀錄
          </h2>
        </div>

        <div class="history-list">
          <div
            v-for="record in viewingHistory"
            :key="record.id"
            class="history-item"
          >
            <div class="movie-info">
              <h3 class="movie-name">{{ record.movieName }}</h3>
              <div class="movie-details">
                <span class="detail-item">
                  <span class="detail-icon">📅</span>
                  {{ record.date }}
                </span>
                <span class="detail-item">
                  <span class="detail-icon">🕒</span>
                  {{ record.time }}
                </span>
                <span class="detail-item">
                  <span class="detail-icon">🎭</span>
                  {{ record.theater }}
                </span>
                <span class="detail-item">
                  <span class="detail-icon">💺</span>
                  {{ record.seat }}
                </span>
              </div>
            </div>

            <div class="ticket-info">
              <div class="ticket-type">{{ record.ticketType }}</div>
              <div class="ticket-count">{{ record.ticketCount }} 張</div>
              <div class="snack-info" v-if="record.snackInfo">
                <span class="detail-icon">🍿</span>
                {{ record.snackInfo }}
              </div>
              <div class="ticket-price">消費金額${{ record.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.member-inform-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 120px 5% 80px;
  color: white;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  animation: gradient 8s linear infinite;
  background-size: 300%;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  opacity: 0.8;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.5rem;
}

/* 會員基本資訊樣式 */
.info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.member-card {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.member-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #ff3366, #ff6b6b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff3366;
}

.member-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.label {
  font-weight: 700;
  color: #cccccc;
  min-width: 100px;
}

.value {
  color: white;
  font-weight: 400;
}

.member-level {
  color: #ffd700;
  font-weight: 600;
}

.points {
  color: #00ff88;
  font-weight: 600;
}

.lottery-btn {
  background: linear-gradient(45deg, #ff3366, #ff6b6b);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.lottery-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

/* 統計區塊樣式 */
.stats-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #cccccc;
}

/* 觀影紀錄樣式 */
.history-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.history-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.movie-info {
  flex: 1;
}

.movie-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.movie-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #cccccc;
}

.detail-icon {
  font-size: 0.8rem;
}

.ticket-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ticket-type {
  font-size: 0.9rem;
  color: #00ff88;
  font-weight: 500;
}

.ticket-count {
  font-size: 0.85rem;
  color: #87ceeb;
  font-weight: 500;
}

.ticket-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffd700;
}

/* 漸層動畫 */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 載入和錯誤狀態樣式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ff3366;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
}

.error-icon {
  font-size: 1.5rem;
}

.retry-button {
  background: linear-gradient(45deg, #ff3366, #ff6b6b);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .member-inform-container {
    padding: 100px 3% 60px;
  }

  .page-title {
    font-size: 2rem;
  }

  .member-card {
    flex-direction: column;
    text-align: center;
  }

  .member-details {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .ticket-info {
    text-align: center;
  }

  .movie-details {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .movie-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
