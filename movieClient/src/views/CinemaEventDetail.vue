<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const event = ref(null);
const loading = ref(true);
const error = ref(null);
const showShareMenu = ref(false);

// 移除所有參加功能相關的狀態
// const hasJoined = ref(false);
// const isPaid = ref(false);
// const joinLoading = ref(false);
// const paymentDeadline = ref(null);
// const isExpired = ref(false);
// const countdown = ref(null);

// 移除付款相關變數
// const showPaymentModal = ref(false);
// const paymentMethod = ref('credit');
// const paymentLoading = ref(false);

// 移除票種相關變數
// const ticketTypes = ref({...});
// const maxTickets = ref(10);

onMounted(async () => {
  try {
    const res = await fetch(
      `https://localhost:7181/api/CinemaEvent/${route.params.id}`
    );
    if (!res.ok) throw new Error("活動不存在");
    const data = await res.json();
    event.value = {
      id: data.id,
      title: data.title,
      description: data.description,
      theaterNumber: data.theaterNumber,
      price: data.price,
      startTime: new Date(data.startTime).toLocaleString("zh-TW"),
      endTime: data.endTime
        ? new Date(data.endTime).toLocaleString("zh-TW")
        : null,
      img: data.img,
      status: data.status || "進行中",
    };

    // 移除參加狀態檢查
    // await checkJoinStatus();
  } catch (err) {
    error.value = err.message || "載入失敗";
  } finally {
    loading.value = false;
  }
});

// 移除所有參加相關函數
// const checkJoinStatus = async () => { ... };
// const startCountdown = () => { ... };
// const joinEvent = async () => { ... };
// const leaveEvent = async () => { ... };
// const confirmPayment = async () => { ... };
// const processPayment = async () => { ... };
// const closePaymentModal = () => { ... };
// const getTotalTickets = () => { ... };
// const getTotalPrice = () => { ... };
// const hasSelectedTickets = () => { ... };

const goBack = () => {
  router.push("/cinemaEvent");
};

const getStatusColor = (status) => {
  switch (status) {
    case "進行中":
      return "#4CAF50";
    case "即將開始":
      return "#FF9800";
    case "已結束":
      return "#9E9E9E";
    default:
      return "#2196F3";
  }
};

const showSuccessMessage = (message) => {
  // 先移除所有現有的 toast
  const existingToasts = document.querySelectorAll('.custom-toast');
  existingToasts.forEach(toast => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  });

  const toast = document.createElement("div");
  toast.className = 'custom-toast';
  
  // 基本樣式
  toast.style.position = "fixed";
  toast.style.top = "100px";
  toast.style.right = "20px";
  toast.style.padding = "1.2rem";
  toast.style.borderRadius = "12px";
  toast.style.zIndex = "99999";
  toast.style.fontSize = "0.9rem";
  toast.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
  toast.style.backdropFilter = "blur(10px)";
  toast.style.border = "1px solid rgba(179, 136, 255, 0.1)";
  toast.style.maxWidth = "350px";
  toast.style.fontWeight = "500";
  toast.style.transition = "all 0.3s ease";
  
  // 根據訊息內容決定樣式
  if (message.includes("失敗") || message.includes("錯誤")) {
    toast.style.background = "rgba(255, 107, 107, 0.15)";
    toast.style.border = "1px solid rgba(255, 107, 107, 0.3)";
    toast.style.color = "#ff6b6b";
    toast.textContent = "❌ " + message;
  } else if (message.includes("成功")) {
    toast.style.background = "rgba(76, 175, 80, 0.15)";
    toast.style.border = "1px solid rgba(76, 175, 80, 0.3)";
    toast.style.color = "#4CAF50";
    toast.textContent = "✅ " + message;
  } else {
    toast.style.background = "rgba(179, 136, 255, 0.15)";
    toast.style.border = "1px solid rgba(179, 136, 255, 0.3)";
    toast.style.color = "#b388ff";
    toast.textContent = "ℹ️ " + message;
  }
  
  // 初始狀態（隱藏）
  toast.style.transform = "translateX(100%)";
  toast.style.opacity = "0";
  
  document.body.appendChild(toast);
  
  // 強制重繪後開始動畫
  setTimeout(() => {
    // 滑入動畫
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
    
    // 如果是失敗訊息，跳動完後立即消失
    if (message.includes("失敗") || message.includes("錯誤")) {
      setTimeout(() => {
        toast.style.animation = "shake 0.6s ease-in-out";
        // 跳動動畫結束後立即消失
        setTimeout(() => {
          if (document.body.contains(toast)) {
            toast.style.transform = "translateX(100%)";
            toast.style.opacity = "0";
            setTimeout(() => {
              if (document.body.contains(toast)) {
                document.body.removeChild(toast);
              }
            }, 300);
          }
        }, 600); // 跳動動畫結束後立即消失
      }, 500);
    } else {
      // 成功或一般訊息，3秒後消失
      setTimeout(() => {
        if (document.body.contains(toast)) {
          toast.style.transform = "translateX(100%)";
          toast.style.opacity = "0";
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }
      }, 3000);
    }
  }, 10);
};

const shareEvent = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showSuccessMessage("活動連結已複製到剪貼簿！");
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = window.location.href;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showSuccessMessage("活動連結已複製到剪貼簿！");
  }
};

const shareToFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  showShareMenu.value = false;
};

const shareToLine = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(
    `https://social-plugins.line.me/lineit/share?url=${url}`,
    "_blank"
  );
  showShareMenu.value = false;
};

const toggleShareMenu = () => {
  showShareMenu.value = !showShareMenu.value;
};
</script>

<template>
  <div class="cinema-event-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="bi bi-exclamation-triangle"></i>
      <h2>載入失敗</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-btn">返回活動列表</button>
    </div>

    <div v-else-if="event" class="event-detail">
      <div class="content-container">
        <div class="event-header">
          <h1 class="event-title">{{ event.title }}</h1>
          <div
            class="event-status"
            :style="{ backgroundColor: getStatusColor(event.status) }"
          >
            {{ event.status }}
          </div>
        </div>

        <div class="event-image-section">
          <img
            v-if="event.img"
            :src="event.img"
            :alt="event.title"
            class="event-image"
          />
          <div v-else class="event-image-placeholder">
            <i class="bi bi-film"></i>
            <p>無活動圖片</p>
          </div>
        </div>

        <!-- 移除懸浮參加狀態視窗 -->
        <!-- <div v-if="hasJoined" class="floating-status-window">...</div> -->

        <div class="event-info-single">
          <div class="info-section">
            <h3 class="section-title">
              <i class="bi bi-info-circle"></i>
              活動詳情
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <i class="bi bi-camera-video"></i>
                <div>
                  <span class="label">影廳</span>
                  <span class="value">{{ event.theaterNumber }} 廳</span>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-currency-dollar"></i>
                <div>
                  <span class="label">票價</span>
                  <span class="value">NT$ {{ event.price }}</span>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-clock"></i>
                <div>
                  <span class="label">開始時間</span>
                  <span class="value">{{ event.startTime }}</span>
                </div>
              </div>
              <div v-if="event.endTime" class="info-item">
                <i class="bi bi-clock-history"></i>
                <div>
                  <span class="label">結束時間</span>
                  <span class="value">{{ event.endTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h3 class="section-title">
              <i class="bi bi-chat-text"></i>
              活動說明
            </h3>
            <p class="description">{{ event.description }}</p>
          </div>
        </div>

        <!-- 移除參加按鈕區域 -->
        <!-- <div v-if="!hasJoined" class="join-section">...</div> -->

        <div class="action-section">
          <button @click="goBack" class="back-btn">
            <i class="bi bi-arrow-left"></i>
            返回列表
          </button>
          <div class="share-container">
            <button @click="toggleShareMenu" class="share-btn">
              <i class="bi bi-share"></i>
              分享活動
            </button>
            <div v-if="showShareMenu" class="share-menu">
              <button @click="shareEvent" class="share-option">
                <i class="bi bi-clipboard"></i>
                複製連結
              </button>
              <button @click="shareToFacebook" class="share-option">
                <i class="bi bi-facebook"></i>
                Facebook
              </button>
              <button @click="shareToLine" class="share-option">
                <i class="bi bi-chat"></i>
                Line
              </button>
            </div>
          </div>
        </div>

        <!-- 移除付款視窗 -->
        <!-- <div v-if="showPaymentModal" class="payment-modal-overlay">...</div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保留基本樣式 */
.cinema-event-detail {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #18182c 60%, #2a2a4a 100%);
  color: #f3f3fa;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #b0b0b0;
  text-align: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(179, 136, 255, 0.3);
  border-top: 2px solid #b388ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.8rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error i {
  font-size: 2.5rem;
  color: #ff6b6b;
  margin-bottom: 0.8rem;
}

.content-container {
  max-width: 600px;
  margin: 0 auto;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.event-title {
  font-size: 2rem;
  font-weight: bold;
  color: #66d9ff;
  margin: 0;
  flex: 1;
}

.event-status {
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
}

.event-image-section {
  margin-bottom: 1.5rem;
}

.event-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(130, 120, 255, 0.2);
  background: #1a1a2e;
}

.event-image-placeholder {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #2a2a4a, #3a3a5a);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b388ff;
  font-size: 2.5rem;
}

.event-image-placeholder p {
  margin-top: 0.8rem;
  font-size: 0.9rem;
  color: #b0b0b0;
}

.event-info-single {
  margin-bottom: 1.5rem;
}

.info-section,
.description-section {
  background: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  padding: 1.2rem;
  border: 1px solid rgba(179, 136, 255, 0.1);
  margin-bottom: 1rem;
}

.description-section {
  padding: 1rem;
  background: rgba(179, 136, 255, 0.05);
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #b388ff;
  font-size: 1rem;
  margin-bottom: 0.8rem;
}

.info-grid {
  display: grid;
  gap: 0.8rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  background: rgba(179, 136, 255, 0.05);
  border-radius: 6px;
}

.info-item i {
  color: #b388ff;
  font-size: 1rem;
  width: 16px;
}

.info-item div {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.7rem;
  color: #b0b0b0;
}

.value {
  font-size: 0.9rem;
  color: #f3f3fa;
  font-weight: 500;
}

.description {
  color: #d0d0d0;
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.back-btn,
.share-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #b388ff;
}

.back-btn {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
}

.back-btn:hover {
  background: #b388ff;
  color: white;
}

.share-btn {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
}

.share-btn:hover {
  background: #b388ff;
  color: white;
}

.share-container {
  position: relative;
}

.share-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(179, 136, 255, 0.3);
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  min-width: 150px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.share-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.8rem;
  background: transparent;
  border: none;
  color: #f3f3fa;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.share-option:hover {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
}

.share-option i {
  width: 16px;
}

/* 移除所有參加相關的 CSS */
/* .floating-status-window { ... } */
/* .join-section { ... } */
/* .payment-modal-overlay { ... } */
/* .ticket-selection { ... } */
/* 等等... */

/* 保留動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .cinema-event-detail {
    padding: 1rem;
  }

  .event-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .event-title {
    font-size: 1.6rem;
  }

  .content-container {
    max-width: 100%;
  }

  .action-section {
    flex-direction: column;
    align-items: center;
  }

  .back-btn,
  .share-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
}
</style>