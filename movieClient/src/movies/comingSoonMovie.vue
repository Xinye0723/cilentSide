<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const months = ["8月", "9月", "10月", "11月", "12月"];
const activeMonth = ref(0);
const comingMovies = ref([]);
const imgBaseUrl = 'https://localhost:7181/';
const router = useRouter();

// 1. 取得「即將上映」電影
function fetchComingMovies() {
  fetch('https://localhost:7181/api/Movies')
    .then(res => res.json())
    .then(data => {
      // 只留 movieStatusId === 1 的
      comingMovies.value = data.filter(m => m.movieStatusId === 1);
    });
}
// 2. 按月份篩選
const filteredMovies = computed(() => {
  // 先抓出使用者選擇的月份（例如 8月=>8）
  const thisMonth = parseInt(months[activeMonth.value]);
  return comingMovies.value.filter(m => {
    if (!m.releaseDate) return false;
    const mMonth = new Date(m.releaseDate).getMonth() + 1;
    return mMonth === thisMonth;
  });
});

function setActiveTag(idx) {
  activeMonth.value = idx;
}

function goToDetail(movieId) {
  router.push(`/movies/${movieId}`);
}

onMounted(fetchComingMovies);
</script>

<template>
  <div>
    <!-- 篩選 chips -->
    <div class="chips-row">
      <button v-for="(month, idx) in months" :key="month" class="chip" :class="{ active: activeMonth === idx }" 
            @mouseover="setActiveTag(idx)">{{ month }}</button>
    </div>
    <!-- 電影列表 -->
    <div class="movie-row d-flex flex-wrap justify-content-center fade-in">
      <div class="movie-card" v-for="(movie, idx) in filteredMovies" :key="movie.movieId" @click="goToDetail(movie.movieId)" 
          :class="{ 'fade-in': true }" :style="{ animationDelay: (idx * 0.08) + 's' }">
        <div class="movie-poster-wrap" style="position: relative;">
          <img :src="imgBaseUrl + movie.posterPicture" class="movie-poster-img" :alt="movie.movieNameChinese" />
          <img v-if="movie.ratingIcon" :src="imgBaseUrl + movie.ratingIcon" class="rating-icon" :alt="movie.ratingDescription" 
                style="position: absolute; bottom: 8px; left: 8px; width: 40px; height: 40px; z-index: 2;" />
        </div>
        <div class="movie-info">
          <div class="movie-title-ch">{{ movie.movieNameChinese }}</div>
          <div class="movie-title-en">{{ movie.movieNameEnglish }}</div>
          <div class="movie-release">上映日期：{{ movie.releaseDate ? movie.releaseDate.slice(0,10) : '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
  .chips-row {
    max-width: 500px;
    margin: 0 auto;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: thin;
    margin-top: 1.2rem;
  }
  .chip{
    border: none; outline: none;
    background: #222;
    color: #fff;
    padding: 0.4em 1.2em;
    border-radius: 18px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .chip.active {
    background: #ffd700;
    color: #222;
    box-shadow: 0 2px 10px #ffd70055;
    position: relative;
  }
  .movie-row {
    max-width: 1400px;      /* 整個區塊最多不超過1200px，居中 */
    margin: 0 auto 2rem auto; /* 自動左右留白+下方空間 */
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;   /* 卡片間距，可調整 */
  }
  .movie-card {
    width: 220px;
    margin: 20px 16px 28px 16px;
    border-radius: 18px;
    background: #202125;
    box-shadow: 0 4px 14px #0008;
    overflow: hidden;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s, transform 0.3s;
    cursor: pointer;
  }
  .movie-poster-img {
    width: 100%;
    height: 320px;
    object-fit: cover;
    border-radius: 18px 18px 0 0;
    background: #191a1f;
  }
  .movie-info {
    display: flex;
    flex-direction: column;
    height: 120px;     /* 可以調整，依你片名多寡決定 */
    padding: 10px 16px 10px 16px;
    text-align: center;
  }
  .movie-title-ch {
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .movie-title-en {
    color: #ffe287;
    font-size: 0.98rem;
    min-height: 1.2em;
  }
  .movie-release {
    color: #7be6fa;
    font-size: 0.98rem;
    margin-top: auto;
    letter-spacing: 0.5px;
    font-family: 'Noto Sans TC', sans-serif;
  }
  .rating-icon {
    border-radius: 6px;
    box-shadow: 0 2px 8px #0008;
    background: #fff;
  }
  .movie-card:hover {
    transform: translateY(-6px) scale(1.04);
    box-shadow: 0 0 24px 6px #7be6fa, 0 4px 16px rgba(0,0,0,0.16);
    z-index: 10;
  }
  .movie-card .movie-poster-img {
    transition: filter 0.3s;
  }
  .movie-card:hover .movie-poster-img {
    filter: brightness(1.05) saturate(1.2);
  }
  .fade-in {
    opacity: 0;
    animation: fadeInList 0.7s cubic-bezier(.6,.8,.2,1) forwards;
  }

  @keyframes fadeInList {
    to {
      opacity: 1;
    }
  }
</style>
