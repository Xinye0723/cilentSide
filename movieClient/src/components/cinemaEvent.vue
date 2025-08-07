<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const events = ref([]);
const loading = ref(true);
const filterStatus = ref("進行中");

onMounted(async () => {
  try {
    const res = await fetch("https://localhost:7181/api/CinemaEvent");
    const data = await res.json();
    console.log("API 原始資料:", data); // 加這行

    events.value = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      theaterNumber: item.theaterNumber,
      price: item.price,
      startTime: new Date(item.startTime).toLocaleString("zh-TW"), // 這樣會自動格式化
      img: item.img,
      status: item.status || "進行中",
    }));

    console.log("處理後的活動資料:", events.value); // 加這行
  } catch (error) {
    console.error("載入活動失敗:", error);
  } finally {
    loading.value = false;
  }
});

const goToDetail = (id) => {
  router.push(`/cinemaEvent/${id}`);
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

const filteredEvents = computed(() => {
  if (filterStatus.value === "全部") {
    return events.value;
  } else if (filterStatus.value === "進行中") {
    return events.value.filter((event) => event.status === "進行中");
  } else if (filterStatus.value === "即將開始") {
    return events.value.filter((event) => event.status === "即將開始");
  }
  return events.value;
});

console.log("所有活動:", events.value);
console.log("目前篩選狀態:", filterStatus.value);
console.log("篩選後活動:", filteredEvents.value);
</script>

<template>
  <div class="cinema-event">
    <h1 class="title">影城活動</h1>
    <div class="subtitle-row">
      <p class="subtitle">精彩電影活動，帶給你前所未有的觀影體驗！</p>
      <div class="filter-buttons">
        <button
          class="filter-btn"
          :class="{ active: filterStatus === '進行中' }"
          @click="filterStatus = '進行中'"
        >
          進行中
        </button>
        <button
          class="filter-btn"
          :class="{ active: filterStatus === '即將開始' }"
          @click="filterStatus = '即將開始'"
        >
          即將開始
        </button>
        <button
          class="filter-btn"
          :class="{ active: filterStatus === '全部' }"
          @click="filterStatus = '全部'"
        >
          全部活動
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <div v-else class="event-grid">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card event-hover"
        @click="goToDetail(event.id)"
      >
        <div class="event-image-container">
          <img
            v-if="event.img"
            :src="event.img"
            class="event-image"
            :alt="event.title"
          />
          <div v-else class="event-image-placeholder">
            <i class="bi bi-film"></i>
          </div>
          <div
            class="event-status"
            :style="{ backgroundColor: getStatusColor(event.status) }"
          >
            {{ event.status }}
          </div>
        </div>

        <div class="event-content">
          <h3 class="event-title">{{ event.title }}</h3>
          <p class="event-description">{{ event.description }}</p>

          <div class="event-details">
            <div class="detail-item">
              <i class="bi bi-camera-video"></i>
              <span>影廳：{{ event.theaterNumber }}</span>
            </div>
            <div class="detail-item">
              <i class="bi bi-currency-dollar"></i>
              <span>票價：NT$ {{ event.price }}</span>
            </div>
            <div class="detail-item">
              <i class="bi bi-clock"></i>
              <span>{{ event.startTime }}</span>
            </div>
          </div>
        </div>

        <div class="event-actions">
          <button class="detail-btn">查看詳情</button>
        </div>
      </div>
    </div>

    <div v-if="!loading && events.length === 0" class="no-events">
      <i class="bi bi-calendar-x"></i>
      <p>目前沒有活動</p>
    </div>
  </div>
</template>

<style scoped>
.cinema-event {
  padding: 2rem 2rem 2rem; /* 增加上方間距，避免被導航欄遮擋 */
  min-height: 100vh;
  background: linear-gradient(135deg, #18182c 60%, #2a2a4a 100%);
  color: #f3f3fa;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
}

.title {
  font-size: 2.8rem;
  font-weight: bold;
  color: #b388ff;
  text-shadow: 0 0 16px #b388ff, 0 0 32px #7c7cfb;
  margin-bottom: 0.5rem;
  animation: flicker 3s infinite;
}

.subtitle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.subtitle {
  color: #b0b0b0;
  font-size: 1.1rem;
  margin: 0;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
  border: 1px solid #b388ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover,
.filter-btn.active {
  background: #b388ff;
  color: white;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #b0b0b0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(179, 136, 255, 0.3);
  border-top: 3px solid #b388ff;
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

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.event-card {
  background: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 20px rgba(130, 120, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(179, 136, 255, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 25px rgba(130, 120, 255, 0.3);
  border-color: rgba(179, 136, 255, 0.3);
}

.event-image-container {
  position: relative;
  margin-bottom: 0.8rem;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1a1a2e;
  transition: transform 0.3s ease;
}

.event-hover:hover .event-image {
  transform: scale(1.02);
}

.event-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2a4a, #3a3a5a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #b388ff;
}

.event-status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 1.2rem;
  color: #66d9ff;
  font-weight: bold;
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.event-description {
  color: #b0b0b0;
  margin-bottom: 0.8rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;

  /* 先寫標準屬性 */
  line-clamp: 2;

  /* 再寫前綴屬性，給目前主流瀏覽器 */
  -webkit-line-clamp: 2;

  overflow: hidden;
  flex: 1;
  font-size: 0.9rem;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #d0d0d0;
  font-size: 0.8rem;
}

.detail-item i {
  color: #b388ff;
  width: 14px;
  font-size: 0.8rem;
}

.event-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.detail-btn {
  background: linear-gradient(90deg, #b388ff 60%, #7c7cfb 100%);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 10px #b388ff55;
}

.detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 15px #b388ff88;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #b0b0b0;
  font-size: 1.2rem;
}

.no-events i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #b388ff;
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .subtitle-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .event-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .title {
    font-size: 2.2rem;
  }

  .event-image-container {
    height: 140px;
  }
}
</style>
