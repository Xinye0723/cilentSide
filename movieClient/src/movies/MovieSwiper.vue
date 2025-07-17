<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { computed, ref } from 'vue';

  const props = defineProps({
    movies: Array,
    imgBaseUrl: String,
    selectedIndex: Number
  });
  // 抓主圖是哪部
  const activeIndex = ref(props.selectedIndex || 0)
  
  function onSlideChange(swiper) {
    activeIndex.value = swiper.realIndex
  }
  // 拿到主圖的 movie
  const mainMovie = computed(() => props.movies[activeIndex.value] || {})

//   function goToBuy(slug) {
//   // 跳轉購票頁（假設你有 /buy/:slug 頁面）
//   window.location.href = `/buy/${slug}`
//   // 或用 router.push({ name: 'buy', params: { slug } })
// }
</script>

<template>
  <swiper :slides-per-view="5" :centered-slides="true" :space-between="0" :initial-slide="2" :loop="true" navigation 
            @slideChange="onSlideChange" class="movie-swiper">
    <swiper-slide v-for="(movie, idx) in movies" :key="movie.movieId">
        <!-- 主圖＋詳情 -->
        <div v-if="activeIndex === idx" class="main-slide-wrap">
            <!-- 主圖 -->
            <img :src="imgBaseUrl + movie.posterPicture" :class="main-poster" />
            <!-- 詳情（顯示當前主圖的資料） -->
            <div class="main-info">
                <h3 class="movie-title-ch">{{ mainMovie.movieNameChinese }}</h3>
                <div class="movie-title-en">{{ movie.movieNameEnglish }}</div>
                <div class="movie-meta">
                    <div>片長：{{ mainMovie.duration }}分鐘</div>
                    <div>導演：{{ mainMovie.director }}</div>
                    <div>主演：{{ mainMovie.starring }}</div>
                    <div>劇情：{{ mainMovie.plot }}</div>
                    <div>上映日期：{{ mainMovie.releaseDate }}</div>
                </div>
                <button class="buy-btn">
                    <i class="bi bi-ticket-perforated me-1"></i>立即購票
                </button>
                <!-- <div class="card-overlay">立即購票</div> -->
            </div>
        </div>
        <!-- 側圖 -->
        <img v-else :src="imgBaseUrl + movie.posterPicture" class="side-poster" />
    </swiper-slide>
  </swiper>
</template>

<style lang="css" scoped>

.buy-btn {
  width: 40%;
  margin: 0.7em auto 1em auto;
  display: block;
  background: linear-gradient(90deg,#ffd700 60%,#ff60ef 100%);
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 999px;
  padding: 8px 0 7px 0;
  box-shadow: 0 2px 12px #ffd70044;
  font-size: 1rem;
  letter-spacing: 0.06em;
  transition: all 0.2s;
  cursor: pointer;
}
.buy-btn:hover {
  background: linear-gradient(90deg,#ffae00 60%,#fc41f4 100%);
  color: #fff;
  box-shadow: 0 4px 18px #ffd70066;
}

/* .card-overlay {
  opacity: 0;
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 12px;
  transition: opacity 0.25s;
}
.movie-card:hover .card-overlay {
  opacity: 1;
} */
</style>