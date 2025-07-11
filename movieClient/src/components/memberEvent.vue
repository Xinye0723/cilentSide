<script setup>
import { ref, onMounted } from 'vue'

// 原始資料（一次性不顯示全部）
const allEvents = [
  {
    id: 1,
    title: 'X 座影廳看電影',
    date: '4月30日',
    time: '19:00',
    location: '台北 INFINITE CINEMA'
  },
  {
    id: 2,
    title: 'X 座影廳看電影',
    date: '5月5日',
    time: '14:00',
    location: '台北 INFINITE CINEMA'
  },
  {
    id: 3,
    title: 'X 座影廳看電影',
    date: '5月11日',
    time: '20:30',
    location: '台北 INFINITE CINEMA'
  }
]

// 用來逐步呈現的陣列
const events = ref([])

// onMounted 時逐張顯示
onMounted(() => {
  allEvents.forEach((event, index) => {
    setTimeout(() => {
      events.value.push(event)
    }, index * 200) // 每張延遲 0.2 秒
  })
})

const viewDetails = (id) => {
  console.log('查看活動 ID：', id)
}
</script>

<template>
  <div class="group-event">
    <h1 class="title">電影揪團活動</h1>
    <p class="subtitle">一起揪團看電影，享受大堆幕震撼體驗！</p>

    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="event-card"
      :style="{ animationDelay: (index * 0.2) + 's' }"
    >
      <div class="icon">
        <i class="fa fa-users"></i>
      </div>
      <div class="event-info">
        <h3>{{ event.title }}</h3>
        <p>{{ event.date }} {{ event.time }}</p>
        <p>{{ event.location }}</p>
      </div>
      <div class="event-action">
        <button @click="viewDetails(event.id)">查看詳情</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 基本樣式 + 美化背景 ========== */
.group-event {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a23, #141433);
  color: white;
  font-family: 'Poppins', 'Noto Sans TC', sans-serif;
}

/* 標題與副標題 */
.title {
  font-size: 2.8rem;
  font-weight: bold;
  color: #a387ff;
  text-shadow: 0 0 10px #a387ff, 0 0 20px #7c7cfb;
  margin-bottom: 0.5rem;
  animation: flicker 3s infinite;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #ccc;
}

/* ========== 活動卡片樣式 ========== */
.event-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1a2e;
  border: 1px solid rgba(130, 120, 255, 0.3);
  box-shadow: 0 0 15px rgba(130, 120, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  /* 動畫初始值與套用 */
  opacity: 0;
  animation: slideFadeIn 0.6s ease forwards;
}

/* hover 放大發光 */
.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(163, 135, 255, 0.5);
}

/* ========== 內容區塊 ========== */
.icon {
  font-size: 2rem;
  color: #a387ff;
  margin-right: 1.5rem;
}

.event-info {
  flex: 1;
}

.event-info h3 {
  font-size: 1.6rem;
  color: #66d9ff;
  margin-bottom: 0.5rem;
}

.event-info p {
  margin: 0.3rem 0;
  color: #ccc;
  font-size: 1rem;
}

/* ========== 按鈕樣式 ========== */
.event-action button {
  background-color: transparent;
  border: 1px solid #a387ff;
  padding: 0.5rem 1.2rem;
  color: #a387ff;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 8px #7c7cfb;
  cursor: pointer;
}

.event-action button:hover {
  background-color: #a387ff;
  color: #000;
  box-shadow: 0 0 12px #a387ff, 0 0 24px #7c7cfb;
  animation: glowPulse 1s infinite;
}

/* ========== 動畫定義 ========== */
@keyframes slideFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glowPulse {
  0% {
    box-shadow: 0 0 8px #a387ff;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 16px #a387ff;
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 8px #a387ff;
    transform: scale(1);
  }
}

@keyframes flicker {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px #a387ff, 0 0 20px #7c7cfb;
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 6px #7c7cfb, 0 0 12px #7c7cfb;
  }
}
</style>
