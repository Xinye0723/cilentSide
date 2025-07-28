<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

  const tags = [
    { TagId: 0, TagName: '全部' },
    { TagId: 1, TagName: '劇情' },
    { TagId: 2, TagName: '動作' },
    { TagId: 3, TagName: '動畫' },
    { TagId: 4, TagName: '冒險' },
    { TagId: 6, TagName: '驚悚' },
    { TagId: 8, TagName: '科幻' },
    { TagId: 9, TagName: '奇幻' },
    { TagId: 11, TagName: '犯罪' },
  ]

  const activeTag = ref(0);
  const movies = ref([]);
  const imgBaseUrl = 'https://localhost:7181/';
  const router = useRouter();
  // 分頁狀態
  const page = ref(1)
  const pageSize = 10 // 每頁顯示 10 張，可自行調整
  // 頁數計算
  const totalPages = computed(() =>
    Math.ceil((movies.value.length || 0) / pageSize)
  )
  // 分頁後的資料
  const pagedMovies = computed(() =>
    movies.value.slice((page.value - 1) * pageSize, page.value * pageSize)
  )
  function goToPage(p) {
    page.value = p;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function prevPage() {
    if (page.value > 1) {
      page.value--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function nextPage() {
    if (page.value < totalPages.value) {
      page.value++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // 取得電影清單
  function fetchMovies(tagId = 0) {
    let apiUrl =
      tagId === 0
        ? 'https://localhost:7181/api/Movies'
        : `https://localhost:7181/api/Movies/ByTag/${tagId}`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        movies.value = data.filter(m => m.movieStatusId === 2).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      });
  }
  // 點擊 chips 時
  function setActiveTag(idx, tagId) {
    activeTag.value = idx;
    page.value = 1;   // ⭐️ 換tag時重置頁數
    fetchMovies(tagId);
  }

  function goToDetail(movieId) {
    router.push(`/movies/${movieId}`);
  }

  onMounted(() => {
    fetchMovies(0);
  });
</script>

<template>
  <div>
    <!-- 篩選 chips -->
    <div class="chips-row">
      <button v-for="(tag, idx) in tags" :key="tag.TagId" class="chip" :class="{active: activeTag === idx}" 
           @click="setActiveTag(idx, tag.TagId)">{{ tag.TagName }}</button>
    </div>
    <!-- 電影列表 -->
    <div class="movie-row d-flex flex-wrap justify-content-center fade-in">
      <div class="movie-card fade-in" v-for="(movie, idx) in pagedMovies" :key="movie.movieId" @click="goToDetail(movie.movieId)" 
          style="cursor: pointer;" :style="{ animationDelay: (idx * 0.08) + 's' }">
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
    <!-- 分頁按鈕 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page <= 1" class="page-arrow">«</button>
      <button v-for="p in totalPages" :key="p" @click="goToPage(p)" :class="['page-btn', { active: page === p }]">{{ p }}</button>
      <button @click="nextPage" :disabled="page >= totalPages" class="page-arrow">»</button>
    </div>
  </div>
</template>

<style lang="css" scoped>
  .chips-row {
    max-width: 770px;
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
    max-width: 1600px;      /* 整個區塊最多不超過1600px，居中 */
    margin: 0 auto 2rem auto; /* 自動左右留白+下方空間 */
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;   /* 卡片間距，可調整 */
  }
  .movie-card {
    width: 260px;
    margin: 25px 1px 1px 1px;
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
    height: 370px;
    object-fit: cover;
    border-radius: 18px 18px 0 0;
    background: #191a1f;
  }
  .movie-info {
    display: flex;
    flex-direction: column;
    height: 155px;     /* 可以調整，依你片名多寡決定 */
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
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin-top: 20px;
    margin-bottom: 24px;
  }
  .page-btn, .page-arrow {
    background: none;
    border: none;
    color: #b9c7e2;
    font-weight: bold;
    font-size: 1.06em;
    min-width: 36px;
    min-height: 36px;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.16s, color 0.16s;
  }
  .page-btn.active, .page-btn:hover {
    background: #7be6fa;
    color: #17181b;
  }
  .page-arrow[disabled],
  .page-btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
