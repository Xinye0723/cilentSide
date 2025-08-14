<script setup>
import { ref, onMounted, computed, watch, onActivated } from "vue";
import { useRouter, useRoute } from "vue-router";
import { RouterLink } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const router = useRouter();
const route = useRoute();
const events = ref([]);
const currentMemberId = ref(null);

// 載入活動資料的函數
const loadEvents = async () => {
  try {
    // 構建API URL，如果有會員ID就加上參數
    let apiUrl = "https://localhost:7181/api/MemberEvent";
    if (currentMemberId.value) {
      apiUrl += `?memberId=${currentMemberId.value}`;
    }
    
    const res = await fetch(apiUrl);
    const data = await res.json();
    events.value = data.map((item) => ({
      id: item.memberEventId,
      title: item.title,
      organizer: item.organizerName,
      organizerId: item.organizerId,
      registered: item.registered,
      maxCapacity: item.maxCapacity,
      isRegistered: item.isRegistered || false, // 新增：是否已報名
      startTime: item.startTime
        ? new Date(item.startTime).toLocaleDateString("zh-TW") +
          " " +
          new Date(item.startTime).toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "時間未定",
      status: item.status,
    }));
  } catch (error) {
    console.error("載入活動資料失敗:", error);
  }
};

onMounted(async () => {
  // 獲取當前會員ID
  currentMemberId.value = localStorage.getItem("memberId");
  // 載入活動資料
  await loadEvents();
});

// ✅ 修改：監聽路由變化，當進入 /memberEvent 時重新載入資料
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === "/memberEvent") {
      console.log("進入活動頁面，重新載入活動資料...");
      await loadEvents();
    }
  },
  { immediate: true }
);

// ✅ 修改：監聽頁面可見性變化
const handleVisibilityChange = async () => {
  if (!document.hidden && route.path === "/memberEvent") {
    console.log("頁面重新可見，重新載入活動資料...");
    await loadEvents();
  }
};

onMounted(() => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

// ✅ 新增：當組件被激活時重新載入資料
onActivated(() => {
  console.log("組件被激活，重新載入活動資料...");
  loadEvents();
});

// 計算屬性：區分自己辦的活動和別人辦的活動
const myEvents = computed(() => {
  if (!currentMemberId.value) return [];
  return events.value.filter(
    (event) => Number(event.organizerId) === Number(currentMemberId.value)
  );
});

const otherEvents = computed(() => {
  if (!currentMemberId.value) return events.value;
  return events.value.filter(
    (event) => Number(event.organizerId) !== Number(currentMemberId.value)
  );
});

// 格式化主辦人顯示文字
const formatOrganizer = (organizerName, organizerId) => {
  if (!organizerName) return "未知主辦人";

  const isMe = Number(organizerId) === Number(currentMemberId.value);
  return isMe ? `${organizerName}(我)` : organizerName;
};

const goToDetail = (id) => {
  router.push(`/memberEvent/${id}`);
};

// ✅ 加這個：跳轉到建立活動頁
const goToCreateEvent = () => {
  router.push("/createMemberEvent");
};

// Swiper 配置
const swiperModules = [Navigation, Pagination, Autoplay];

const swiperOptions = {
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: true,
  pagination: {
    clickable: true,
    dynamicBullets: true,
  },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  breakpoints: {
    640: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
};
</script>

<template>
  <div class="group-event">
    <h1 class="title">INFINITY 揪團活動</h1>
    <div class="subtitle-row">
      <p class="subtitle">電影可以重播，揪團必須即時！</p>
      <RouterLink to="/createMemberEvent">
        <button class="create-btn">➕ 我要辦團</button>
      </RouterLink>
    </div>

    <!-- 我辦的活動區塊 -->
    <div v-if="myEvents.length > 0" class="event-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="cinema-icon">∞</span>
          主辦人是我！
        </h2>
        <span class="event-count">{{ myEvents.length }} 個活動</span>
      </div>

      <!-- Swiper 輪播 -->
      <div class="swiper-container">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="swiperOptions.slidesPerView"
          :space-between="swiperOptions.spaceBetween"
          :navigation="swiperOptions.navigation"
          :pagination="swiperOptions.pagination"
          :autoplay="swiperOptions.autoplay"
          :breakpoints="swiperOptions.breakpoints"
          class="my-events-swiper"
        >
          <SwiperSlide
            v-for="event in myEvents"
            :key="event.id"
            class="swiper-slide"
          >
            <div class="event-card my-event-card">
              <!-- 我辦的活動不顯示已報名標識 -->
              
              <div class="event-card-header">
                <h3 class="event-card-title">{{ event.title }}</h3>
                <span class="organizer-badge"
                  >主辦人
                  {{
                    formatOrganizer(event.organizer, event.organizerId)
                  }}</span
                >
              </div>

              <div class="event-card-content">
                <div class="event-meta">
                  <div class="meta-item">
                    <i class="bi bi-people-fill"></i>
                    <span
                      >報名：{{ event.registered }}/{{
                        event.maxCapacity
                      }}</span
                    >
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-calendar-check"></i>
                    <span>狀態：{{ event.status || "無" }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-clock"></i>
                    <span>時間：{{ event.startTime }}</span>
                  </div>
                </div>
              </div>

              <div class="event-card-footer">
                <RouterLink :to="`/memberEventDetail/${event.id}`">
                  <button class="detail-btn">查看詳情</button>
                </RouterLink>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>

    <!-- 其他活動區塊 - 也改成輪播 -->
    <div v-if="otherEvents.length > 0" class="event-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="cinema-icon">∞</span>
          {{ myEvents.length > 0 ? "參加活動" : "所有活動" }}
        </h2>
        <span class="event-count">{{ otherEvents.length }} 個活動</span>
      </div>

      <!-- Swiper 輪播 -->
      <div class="swiper-container">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="swiperOptions.slidesPerView"
          :space-between="swiperOptions.spaceBetween"
          :navigation="swiperOptions.navigation"
          :pagination="swiperOptions.pagination"
          :autoplay="swiperOptions.autoplay"
          :breakpoints="swiperOptions.breakpoints"
          class="other-events-swiper"
        >
          <SwiperSlide
            v-for="event in otherEvents"
            :key="event.id"
            class="swiper-slide"
          >
            <div class="event-card other-event-card">
              <!-- 只有其他人辦的活動且已報名才顯示標識 -->
              <div v-if="event.isRegistered" class="registered-badge">
                已報名
              </div>
              
              <div class="event-card-header">
                <h3 class="event-card-title">{{ event.title }}</h3>
                <span class="organizer-badge other-organizer"
                  >主辦人
                  {{
                    formatOrganizer(event.organizer, event.organizerId)
                  }}</span
                >
              </div>

              <div class="event-card-content">
                <div class="event-meta">
                  <div class="meta-item">
                    <i class="bi bi-people-fill"></i>
                    <span
                      >報名：{{ event.registered }}/{{
                        event.maxCapacity
                      }}</span
                    >
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-calendar-check"></i>
                    <span>狀態：{{ event.status || "無" }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-clock"></i>
                    <span>時間：{{ event.startTime }}</span>
                  </div>
                </div>
              </div>

              <div class="event-card-footer">
                <RouterLink :to="`/memberEventDetail/${event.id}`">
                  <button class="detail-btn">查看詳情</button>
                </RouterLink>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>

    <!-- 如果沒有活動時的提示 -->
    <div v-if="events.length === 0" class="no-events">
      <div class="no-events-content">
        <i class="bi bi-calendar-x"></i>
        <h3>目前沒有揪團活動</h3>
        <p>成為第一個舉辦活動的人吧！</p>
        <RouterLink to="/createMemberEvent">
          <button class="create-first-btn">➕ 舉辦第一個活動</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-event {
  padding: 2rem 2rem 2rem;
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
  color: #ccc;
  font-size: 1.1rem;
  margin: 0;
}

.create-btn {
  background: linear-gradient(90deg, #b388ff 60%, 	#B9B9FF 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 12px #b388ff55;
  transition: background 0.3s, box-shadow 0.3s;
}

.create-btn:hover {
  background: linear-gradient(90deg, #7c7cfb 60%, #b388ff 100%);
  box-shadow: 0 0 18px #b388ff77;
}

.event-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  color: #b388ff;
  font-size: 1.8rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-count {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(179, 136, 255, 0.2);
}

/* Swiper 樣式 */
.swiper-container {
  position: relative;
  padding: 1rem 0;
}

.my-events-swiper,
.other-events-swiper {
  padding: 1rem 0;
}

.swiper-slide {
  height: auto;
}

.event-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  border: 1px solid rgba(179, 136, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative; /* 新增：讓子元素可以絕對定位 */
}

/* 修改：已報名標識樣式 - 調整粉色更重 */
.registered-badge {
  position: absolute;
  top: 24px;
  right: 12px;
  background: rgba(255, 105, 135, 0.9); /* 改為更重的粉色 */
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 10;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 105, 135, 0.3); /* 邊框也調整為對應顏色 */
}

.my-event-card {
  border-color: rgba(255, 193, 7, 0.3);
  box-shadow: 0 8px 32px rgba(255, 193, 7, 0.1);
}

.other-event-card {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(179, 136, 255, 0.3);
}

.my-event-card:hover {
  border-color: rgba(255, 193, 7, 0.5);
  box-shadow: 0 12px 40px rgba(255, 193, 7, 0.2);
}

.other-event-card:hover {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.2);
}

.event-card-header {
  margin-bottom: 1rem;
}

.event-card-title {
  color: #b388ff;
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
  font-weight: bold;
}

.organizer-badge {
  background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
  color: #1a1a2e;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-block;
}

.other-organizer {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.event-card-content {
  flex: 1;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.meta-item i {
  color: #b388ff;
  width: 16px;
}

.event-card-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.detail-btn {
  background: linear-gradient(90deg, #b388ff 60%, #7c7cfb 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.detail-btn:hover {
  background: linear-gradient(90deg, #7c7cfb 60%, #b388ff 100%);
  transform: translateY(-2px);
}

/* Swiper 導航按鈕樣式 */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #b388ff;
  background: rgba(26, 26, 46, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(179, 136, 255, 0.2);
}

:deep(.swiper-pagination-bullet) {
  background: #b388ff;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #b388ff;
}

/* 其他活動列表樣式保持不變 */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-row {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(179, 136, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(179, 136, 255, 0.3);
}

.event-info-block {
  flex: 1;
}

.event-title {
  color: #b388ff;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.organizer-info {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.8rem;
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.event-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.event-time {
  color: #999;
  font-size: 0.9rem;
}

.no-events {
  text-align: center;
  padding: 4rem 2rem;
}

.no-events-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-events-content i {
  font-size: 4rem;
  color: #b388ff;
  margin-bottom: 1rem;
}

.no-events-content h3 {
  color: #b388ff;
  margin-bottom: 0.5rem;
}

.no-events-content p {
  color: #ccc;
  margin-bottom: 2rem;
}

.create-first-btn {
  background: linear-gradient(90deg, #b388ff 60%, #7c7cfb 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 12px #b388ff55;
  transition: all 0.3s ease;
}

.create-first-btn:hover {
  background: linear-gradient(90deg, #7c7cfb 60%, #b388ff 100%);
  box-shadow: 0 0 18px #b388ff77;
  transform: translateY(-2px);
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

/* 響應式設計 */
@media (max-width: 768px) {
  .group-event {
    padding: 4rem 1rem 2rem 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* 影城符號樣式 */
.cinema-icon {
  display: inline-block;
  font-size: 1.2em;
  font-weight: bold;
  color: #e91e63; /* 影城標題的粉紅色 */
  margin-right: 0.5rem;
  text-shadow: 0 0 10px rgba(233, 30, 99, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
}
</style>
