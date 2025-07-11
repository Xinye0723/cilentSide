<script setup>
import { useRoute } from 'vue-router'
import dragonImg from '@/assets/te/馴龍高手.jpg'
import conanImg from '@/assets/te/貝克街.jpg'
import topgunImg from '@/assets/te/捍衛戰士.jpg'

// 取得網址上的 id
const route = useRoute()
const id = route.params.id

// 所有活動資料（跟 CinemaEvent 裡的同樣）
const eventMap = {
  1: {
    title: '【馴龍高手】抽獎活動',
    image: dragonImg,
    description: '前往新加坡環球影城！'
  },
  2: {
    title: '【貝克街的亡靈】回歸大銀幕',
    image: conanImg,
    description: '一起用大螢幕重溫童年經典'
  },
  3: {
    title: '【捍衛戰士】熱血飛行',
    image: topgunImg,
    description: '翱翔天際，重燃熱血'
  }
}

// 根據 id 拿資料
const event = eventMap[id]
</script>

<template>
  <div v-if="event" class="event-detail">
    <img :src="event.image" class="banner" />
    <h1>{{ event.title }}</h1>
    <p>{{ event.description }}</p>
  </div>
  <div v-else>
    <p>找不到這個活動喔～</p>
  </div>
</template>

<style scoped>
.banner {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
}
</style>
