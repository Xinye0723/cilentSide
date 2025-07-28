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
      <div v-for="event in events" :key="event.id" class="event-row">
        <div class="event-title">{{ event.title }}</div>
        <div class="event-organizer">主辦人：{{ event.organizer }}</div>
        <div class="event-info">
          報名：{{ event.registered }}/{{ event.maxCapacity }}
        </div>
        <div class="event-time">時間：{{ event.startTime }}</div>
        <div class="event-status">狀態：{{ event.status }}</div>
        <RouterLink :to="`/memberEventDetail/${event.id}`">
          <button class="detail-btn">查看詳情</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

console.log("memberEvent.vue 已載入"); // 這行應該要顯示

const events = ref([]);

onMounted(async () => {
  console.log("onMounted 開始執行"); // 這行應該要顯示

  const res = await fetch("http://localhost:7181/api/MemberEvent");
  const data = await res.json();
  console.log("API 原始資料:", data); // 這行應該要顯示

  events.value = data.map((item) => {
    console.log("item.startTime 原始值:", item.startTime); // 這行應該要顯示
    return {
      id: item.memberEventId,
      title: item.title,
      organizer: item.organizerName || "",
      registered: item.registered,
      maxCapacity: item.maxCapacity,
      startTime: item.startTime
        ? new Date(item.startTime).toLocaleDateString("zh-TW") +
          " " +
          new Date(item.startTime).toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "時間未定",
      status: item.status,
    };
  });
});
</script>

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
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.event-row {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 1.2rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 0 10px #a387ff33;
  font-size: 1.1rem;
}
.event-col {
  flex: 1;
  text-align: center;
}
.event-title {
  color: #66d9ff;
  font-weight: bold;
  font-size: 1.2rem;
}
.event-organizer {
  color: #ccc;
  font-size: 0.9rem;
}
.event-info {
  color: #b3b3e6;
  font-size: 0.9rem;
}
.event-time {
  color: #b3b3e6;
  font-size: 0.9rem;
}
.event-status {
  color: #b3b3e6;
  font-size: 0.9rem;
}
.detail-btn {
  background: #a387ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  margin-left: 1.5rem;
  transition: background 0.2s;
}
.detail-btn:hover {
  background: #7e5de4;
}
</style>
