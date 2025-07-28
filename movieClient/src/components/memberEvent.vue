<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { RouterLink } from "vue-router";

const router = useRouter();
const events = ref([]);

onMounted(async () => {
  const res = await fetch("http://localhost:5276/api/MemberEvent");
  const data = await res.json();
  events.value = data.map(item => ({
    id: item.memberEventId,
    title: item.title,
    organizer: item.organizerName,
    registered: item.registered,
    maxCapacity: item.maxCapacity,
    startTime: item.startTime,
    status: item.status
  }));
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
    <div class="subtitle-row">
      <p class="subtitle">一起揪團看電影，享受大堆幕震撼體驗！</p>
      <RouterLink to="/createMemberEvent">
        <button class="create-btn">➕ 我要辦團</button>
      </RouterLink>
    </div>
    <div class="event-list">
      <div
        v-for="event in events"
        :key="event.id"
        class="event-row event-hover"
      >
        <div class="event-info-block">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-meta">
            <span>報名：{{ event.registered }}/{{ event.maxCapacity }}</span>
            <span>狀態：{{ event.status || '無' }}</span>
          </div>
          <div class="event-time">時間：{{ event.startTime }}</div>
        </div>
        <RouterLink :to="`/memberEventDetail/${event.id}`">
          <button class="detail-btn">查看詳情</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>


<style scoped>
.group-event {
  padding: 2rem;
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
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.create-btn {
  background: linear-gradient(90deg, #b388ff 60%, #7c7cfb 100%);
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
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.event-row {
  background: linear-gradient(120deg, #23234a 70%, #3a2a5a 100%);
  border-radius: 16px;
  padding: 1.2rem 2rem;
  box-shadow: 0 2px 10px #b388ff22;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  cursor: pointer;
}
.event-row:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px 0 #b388ff33, 0 0 0 #fff;
  z-index: 2;
}
.event-info-block {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.event-title {
  color: #a387ff;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  letter-spacing: 1px;
  text-shadow: 0 0 8px #a387ff33;
}
.event-meta {
  color: #e0e0fa;
  font-size: 1rem;
  display: flex;
  gap: 2rem;
  margin-bottom: 0.2rem;
}
.event-time {
  color: #7c7cfb;
  font-size: 1rem;
}
.detail-btn {
  background: linear-gradient(90deg, #5a3fa7 60%, #2e6ad7 100%);
  color: #f3f3fa;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 1.5rem;
  font-weight: bold;
  box-shadow: 0 0 8px #5a3fa755;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
}
.detail-btn:hover {
  background: linear-gradient(90deg, #2e6ad7 60%, #5a3fa7 100%);
  color: #fff;
  box-shadow: 0 0 14px #5a3fa799;
}
@keyframes flicker {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px #b388ff, 0 0 20px #7c7cfb;
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 6px #7c7cfb, 0 0 12px #7c7cfb;
  }
}
</style>
