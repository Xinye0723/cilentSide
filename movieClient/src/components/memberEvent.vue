<script setup>
import { ref } from 'vue'

const events = ref([
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
])

const viewDetails = (id) => {
  // TODO: 跳轉到詳細頁，或打開 modal
  console.log('查看活動 ID：', id)
}
</script>

<template>
  <div class="group-event">
    <h1 class="title">電影揪團活動</h1>
    <p class="subtitle">一起揪團看電影，享受大堆幕震撼體驗！</p>

    <div v-for="event in events" :key="event.id" class="event-card">
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
.group-event {
  padding: 2rem;
  color: white;
  background-color: #000;
}

.title {
  font-size: 2.5rem;
  color: #a387ff;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #ccc;
}

.event-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.icon {
  font-size: 2rem;
  color: #fff;
  margin-right: 1rem;
}

.event-info {
  flex: 1;
}

.event-info h3 {
  font-size: 1.4rem;
  margin-bottom: 0.3rem;
}

.event-info p {
  margin: 0.2rem 0;
  color: #bbb;
}

.event-action button {
  background-color: #7c7cfb;
  border: none;
  padding: 0.5rem 1rem;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.event-action button:hover {
  background-color: #a387ff;
}
</style>
