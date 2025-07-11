<script setup>
import { computed, onMounted, ref } from 'vue';

  const tags = ['全部', '劇情', '動作', '動畫', '驚悚', '科幻', '冒險', '喜劇', '家庭', '紀錄片']
  // const tags = ref([
  //   {"name":"全部"},
  //   {"name":"劇情"},
  //   {"name":"動作"},
  //   {"name":"動畫"},
  //   {"name":"驚悚"},
  //   {"name":"科幻"},
  //   {"name":"冒險"},
  //   {"name":"喜劇"},
  //   {"name":"家庭"},
  //   {"name":"紀錄片"}
  // ])
  const activeTag = ref(0);
  function setActiveTag(idx) {
    activeTag.value = idx;
  }

  const sortType = ref('popular')
  const allMovies = ref([]); // 所有電影資料
  const filteredMovies = computed(() => {
    // 取得目前的類型名稱
    const selectedTag = tags[activeTag.value];
  
    // 過濾電影
    let result = allMovies.value.filter(m => m.movieStatusId === 2);
    if (selectedTag !== '全部') {
      result = result.filter(m => m.tags?.includes(selectedTag));
    }

    // 排序邏輯
    if (sortType.value === 'popular') {
      result = result.slice().sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortType.value === 'latest') {
      result = result.slice().sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    }
    return result;
  });
  onMounted(() => {
    fetch('https://localhost:7181/api/Movies')
    .then(res => res.json())
    .then(data => {
      // ✅ 只保留已上映的電影
      allMovies.value = data.filter(m => m.movieStatusId === 2);
    });
  });
</script>

<template>
  <div>
    <!-- 篩選 chips -->
    <div class="chips-row">
      <button v-for="(tag, idx) in tags" :key="tag" class="chip" :class="{active: activeTag.value === idx}" 
        @click="setActiveTag(idx)">{{ tag }}</button>
    </div>
    <!-- 電影列表 -->
    <div class="movie-row d-flex flex-wrap justify-content-center">
      <div class="movie-card" v-for="movie in filteredMovies" :key="movie.slug">
        <img :src="`/${movie.posterPicture}`" class="movie-poster-img" :alt="movie.movieNameChinese" />
        <div class="movie-title">{{ movie.movieNameChinese }}</div>
      </div>
    </div>
  </div>
  <!-- <select v-model="sortType" class="movie-sort-select">
    <option value="popular">熱門</option>
    <option value="recent">最新</option>
    <option value="rating">評分</option>
  </select> -->
  <!-- 下方可根據 activeTag 控制顯示的電影內容 -->
  <!-- <MovieList :tag="tags[activeTag].name" :sort="sortType" /> -->
</template>

<style lang="css" scoped>
  .chips-row {
    max-width: 870px;
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
    width: 14vw;            /* 每張圖寬度用vw控制，視窗縮放自動變動 */
    min-width: 140px;       /* 最小寬度不變形 */
    max-width: 180px;       /* 最多不超過180px */
    background: #222;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 6px 24px #0004;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .movie-poster-img {
    width: 100%;
    height: 260px;           /* 圖片統一高度，視覺統一 */
    object-fit: cover;
    border-radius: 10px 10px 0 0;
    background: #222;
  }
  /* .chip.active::after {
    content: '';
    display: block;
    height: 4px;
    width: 70%;
    background: linear-gradient(90deg,#ffd700,#ff60ef);
    border-radius: 3px;
    margin: 4px auto 0 auto;
    animation: underline-in 0.2s;
  }
  @keyframes underline-in {
    from { width:0; opacity:0;}
    to { width:70%; opacity:1;}
  } */
  /* .movie-sort-select {
    margin-left: 1.5rem;
    border-radius: 12px;
    padding: 0.4em 1.2em;
    font-size: 1rem;
  } */
</style>
