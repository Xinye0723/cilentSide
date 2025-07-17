<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const events = ref([]);

onMounted(async () => {
  try {
    const res = await fetch("https://localhost:7181/api/MemberEvent");
    const data = await res.json();

    events.value = data.map((item) => ({
      id: item.memberEventId,
      title: item.title,
      date: item.startTime.split("T")[0].replace(/-/g, "/"),
      time: item.startTime.split("T")[1].slice(0, 5),
      location: `影廳 ${item.theaterNumber} 號`,
    }));
  } catch (err) {
    console.error("❌ 無法取得活動資料", err);
  }
});

const goToDetail = (id) => {
  router.push(`/memberEvent/${id}`);
};

// ✅ 加這個：跳轉到建立活動頁
const goToCreateEvent = () => {
  router.push("/createMemberEvent");
};
</script>

<template>
  <div class="group-event">
    <h1 class="title">電影揪團活動</h1>

    <!-- ✅ 將副標與按鈕包在同一行 -->
    <div class="subtitle-row">
      <p class="subtitle">一起揪團看電影，享受大堆幕震撼體驗！</p>
      <button class="create-btn" @click="goToCreateEvent">➕ 我要辦團</button>
    </div>

    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="event-card"
      :style="{ animationDelay: index * 0.2 + 's' }"
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
        <button @click="goToDetail(event.id)">查看詳情</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-event {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a23, #141433);
  color: white;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
}

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
  margin-bottom: 1rem;
  color: #ccc;
  margin: 0;
  flex: 1;
}

.subtitle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

/* ✅ 我要辦團按鈕樣式 */
.create-button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.create-btn {
  background-color: #a387ff;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 12px #a387ff;
  transition: all 0.3s ease;
}

.create-btn:hover {
  background-color: #7e5de4;
  box-shadow: 0 0 18px #7e5de4;
}

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
  opacity: 0;
  animation: slideFadeIn 0.6s ease forwards;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(163, 135, 255, 0.5);
}

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
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 10px #a387ff, 0 0 20px #7c7cfb;
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 6px #7c7cfb, 0 0 12px #7c7cfb;
  }
}
</style>
