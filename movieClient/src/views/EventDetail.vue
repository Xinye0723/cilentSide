<script setup>
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";

import dragonImg from "@/assets/te/馴龍高手.jpg";
import conanImg from "@/assets/te/貝克街.jpg";
import topgunImg from "@/assets/te/捍衛戰士.jpg";

// 取得網址上的 id
const route = useRoute();
const id = route.params.id;

// 活動資料對照表
const eventMap = {
  1: {
    title: "【馴龍高手】抽獎活動",
    image: dragonImg,
    description: "看《馴龍高手》就有機會前往新加坡環球影城！",
    time: "2025/08/15 - 2025/09/01",
    location: "INFINITY CINEMA影城",
    steps: [
      "🎯1️⃣ 註冊成為會員",
      "🎯2️⃣ 點選參加活動按鈕",
      "🎯3️⃣ 等待抽獎結果公布",
    ],
  },
  2: {
    title: "【貝克街的亡靈】回歸大銀幕",
    image: conanImg,
    description: "過了十幾年的電影再次上映，讓大家一起用大螢幕重溫童年經典！",
    time: "2025/09/05 - 2025/09/30",
    location: "INFINITY CINEMA影城",
    steps: [
      "🕵️‍♂️1️⃣ 完成觀影問答",
      "🕵️‍♂️2️⃣ 填寫資料參加抽獎",
      "🕵️‍♂️3️⃣ 等待公布得獎名單",
    ],
  },
  3: {
    title: "【捍衛戰士】熱血飛行",
    image: topgunImg,
    description: "空軍精英飛官齊聚「TOP GUN」訓練基地，翱翔天際，重燃熱血！",
    time: "2025/10/01 - 2025/10/20",
    location: "INFINITY CINEMA影城",
    steps: [
      "✈️1️⃣ 登入會員並認證軍種",
      "✈️2️⃣ 預約觀影場次",
      "✈️3️⃣ 完成觀影即可獲得參加資格",
    ],
  },
};
const event = eventMap[id];
</script>

<template>
  <div v-if="event" class="event-detail">
    <div class="banner-wrapper">
      <img :src="event.image" class="banner" />
    </div>

    <h1>{{ event.title }}</h1>
    <p class="description">{{ event.description }}</p>

    <!-- <p class="detail">
      本活動為《馴龍高手》專屬觀影禮，參加者有機會獲得免費電影票與限量贈品。
      名單將於 9 月初公布，敬請期待！
    </p> -->

    <!-- 時間與地點卡片排版 -->
    <div class="info-cards">
      <div class="info-card">
        <i class="bi bi-clock-fill"></i>
        <div class="info-text">
          <span class="label">活動時間</span>
          <span class="value">{{ event.time }}</span>
        </div>
      </div>
      <div class="info-card">
        <i class="bi bi-geo-alt-fill"></i>
        <div class="info-text">
          <span class="label">活動地點</span>
          <span class="value">{{ event.location }}</span>
        </div>
      </div>
    </div>
    <div>
      <ul class="steps">
        <li v-for="(step, index) in event.steps" :key="index">{{ step }}</li>
      </ul>
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
