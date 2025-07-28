<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';

  const images = [
    '/carousel/InfinityCinema.jpg',
    '/carousel/KimetsuNoYaiba.jpg',
    '/carousel/OmniscientReadersViewpoint.jpg',
    '/carousel/TheFantasticFour.jpg',
    '/carousel/Superman.jpg',
    '/carousel/JurassicWorldRebirth.jpg',
    '/carousel/F1.jpg'
  ];
  // Swiper refs
  const thumbsSwiper = ref(null);
  function onThumbsSwiper(swiperInstance) {
    thumbsSwiper.value = swiperInstance;
  }
</script>

<template>
  <!-- 主圖 Swiper -->
  <div class="main-swiper-wrap">
    <Swiper :modules="[Autoplay, Thumbs]" :autoplay="{ delay: 2500, disableOnInteraction: false }" :loop="true" 
            :thumbs="{ swiper: thumbsSwiper }" class="main-swiper">
      <swiper-slide v-for="img in images" :key="img">
        <img :src="img" class="carousel-img" />
      </swiper-slide>
    </Swiper>
  </div>
  <!-- 縮圖 Swiper -->
  <div class="thumbs-swiper-wrap">
    <Swiper :modules="[Thumbs]" :slides-per-view="Math.min(7, images.length)" 
            :loop="true" watch-slides-progress class="thumbs-swiper" @swiper="onThumbsSwiper">
      <swiper-slide v-for="img in images" :key="img">
        <img :src="img" class="thumb-img" />
      </swiper-slide>
    </Swiper>
  </div>
</template>

<style lang="css" scoped>
  .main-swiper-wrap {
    margin-top: 30px; /* 跟導覽列留空 */
    margin-bottom: 10px;
  }
  .main-swiper {
    width: 1200px;
    height: 510px;
    margin: 0 auto;
    border-radius: 18px;
    background: #17181b;
    box-shadow: 0 6px 32px #0005;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .main-swiper::after {
    content: '';
    position: absolute;
    left: 50%; bottom: -42px; transform: translateX(-50%);
    width: 85%; height: 46px;
    border-radius: 30px;
    background: radial-gradient(ellipse at center, #7be6fa44 0%, transparent 70%);
    filter: blur(14px);
    z-index: 1;
    pointer-events: none;
  }
  .carousel-img {
    width: 100%;
    max-height: 510px;
    object-fit: cover;
    border-radius: 16px;
    border: 2.5px solid #232538;
    box-shadow: 0 4px 24px #7be6fa44, 0 1.5px 0 #fff2;
  }
  .thumbs-swiper-wrap {
    margin-top: 5px;
    margin-bottom: 20px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
  .thumbs-swiper {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
  }
  .thumb-img {
    width: 100px;
    height: 42px;
    object-fit: cover;
    box-shadow: 0 2px 8px #0002;
    opacity: 0.6;
    transition: box-shadow 0.2s, opacity 0.2s;
    cursor: pointer;
  }
  .swiper-slide-thumb-active .thumb-img {
    opacity: 1;
    box-shadow: 0 4px 18px #7be6fa66, 0 1px 0 #fff1;
    border: 1.5px solid #fff;
  }
</style>