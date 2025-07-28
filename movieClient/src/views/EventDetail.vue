<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";

const route = useRoute();
const id = route.params.id;
const event = ref(null);

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:5276/api/CinemaEvent/${id}`);
    if (!res.ok) throw new Error("找不到活動");
    const data = await res.json();
    event.value = data;
    console.log("event.value", event.value); // 加這行
  } catch (err) {
    event.value = null;
    console.error(err);
  }
});
</script>

<template>
  <div v-if="event" class="event-detail">
    <div class="banner-wrapper">
      <img :src="event.img" class="banner" />
    </div>
    <h1>{{ event.title }}</h1>
    <p class="description">{{ event.description }}</p>

    <!-- 新增活動資訊 -->
    <div class="info-cards">
      <div class="info-card">
        <span class="label">地點：</span>
        <span class="value">影廳 {{ event.theaterNumber }} 號</span>
      </div>
      <div class="info-card">
        <span class="label">報名開始：</span>
        <span class="value">{{ event.startTime }}</span>
      </div>
      <div class="info-card">
        <span class="label">報名結束：</span>
        <span class="value">{{ event.endTime }}</span>
      </div>
      <div class="info-card">
        <span class="label">狀態：</span>
        <span class="value">{{ event.status }}</span>
      </div>
    </div>

    <RouterLink to="/cinemaEvent" class="back-btn">
      <i class="bi bi-box-arrow-in-left"></i> 返回活動列表
    </RouterLink>
  </div>
  <div v-else class="not-found">
    <p>找不到這個活動喔～</p>
  </div>
</template>

<style scoped>
.event-detail {
  padding: 2rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  color: white;
  text-align: center;
}

.banner-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  background-color: #000;
}

.banner {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #a387ff;
}

.description {
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  color: #ccc;
}

.info {
  font-size: 1rem;
  margin: 0.25rem 0;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.detail {
  margin-top: 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #eee;
  background-color: #1f1f2e;
  padding: 1rem;
  border-radius: 8px;

  /* ✅ 加這行讓他與圖片同寬 */
  width: 100%;
  text-align: center;
}

.steps {
  margin-top: 1rem;
  padding-left: 1.5rem;
  text-align: center;
  color: #fff;
  list-style: none;
}

.steps li {
  margin: 0.6rem 0;
  font-size: 1rem;
  position: relative;
  padding-left: 1.2rem;
}

.back-btn {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.6rem 1.2rem;
  background-color: #a387ff;
  color: white;
  border-radius: 999px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #9f35ff;
}

.not-found {
  padding: 2rem;
  text-align: center;
  color: #ff7b7b;
}
.info-cards {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: #2a2a3f;
  padding: 1rem 1.2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  min-width: 260px;
}

.info-card i {
  font-size: 1.5rem;
  color: #a387ff;
}

.info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.label {
  font-weight: bold;
  font-size: 0.95rem;
  color: #aaa;
}

.value {
  font-size: 1rem;
  color: #fff;
}
</style>
