<script setup>
import { ref } from 'vue'
import dragonImg from '@/assets/te/馴龍高手.jpg'
import conan from '@/assets/te/貝克街.jpg'
import topgun from '@/assets/te/捍衛戰士.jpg'

const events = ref([
  {
    id: 1,
    category: '官方活動',
    title: '【馴龍高手】抽獎活動得獎名單',
    description: '抽獎活動得獎名單公布，看【馴龍高手】就有機會前往新加坡環球影城！',
    image: dragonImg
  },
  {
    id: 2,
    category: '重溫童年',
    title: '【貝克街的亡靈】帶大家重溫虛擬世界',
    description: '過了十幾年的電影回歸大螢幕，讓大家一起用大螢幕回味！',
    image: conan
  },
  {
    id: 3,
    category: '重溫熱血飛行夢',
    title: '【捍衛戰士】熱血歸來，帶你翱翔天際！',
    description: '空軍精英飛官齊聚「TOP GUN」訓練基地，速度與膽量交織，展現男人的榮耀與激情！',
    image: topgun
  }
])
</script>

<template>
  <div class="cinema-event">
    <div class="hero">
      <h1 class="hero-title">影城活動</h1>
    </div>

    <div class="event-grid">
      <div v-for="event in events" :key="event.id" class="event-card">
        <img :src="event.image" alt="活動圖片" class="event-image" />
        <div class="event-category">{{ event.category }}</div>
        <h3 class="event-title">{{ event.title }}</h3>
        <p class="event-description">{{ event.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cinema-event {
  background-color: #0d0d1c;
  color: white;
  min-height: 100vh;
  padding-bottom: 2rem;
  font-family: "Noto Sans TC", sans-serif;
}

.hero {
  background-image: url('https://picsum.photos/1600/400?grayscale');
  background-size: cover;
  background-position: center;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  color: white;
  letter-spacing: 2px;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: 3rem;
  justify-items: center;
}

.event-card {
  background-color: #1a1a2f;
  border-radius: 12px;
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
}

.event-image-wrapper {
  width: 100%;
  height: auto;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.event-category {
  background-color: #7c7cfb;
  color: white;
  padding: 0.4rem 0.8rem;
  display: inline-block;
  margin: 1rem;
  font-size: 0.75rem;
  border-radius: 999px;
  font-weight: 600;
}

.event-title {
  font-size: 1.2rem;
  padding: 0 1rem;
  margin: 0.5rem 0;
  color: white;
  font-weight: bold;
}

.event-description {
  font-size: 0.95rem;
  color: #ccc;
  padding: 0 1rem 1rem;
  line-height: 1.5;
}
</style>
