<script setup>
  const { movies } = defineProps({ movies: Array });
</script>

<template>
  <div>
    <div class="movie-row d-flex justify-content-center flex-wrap">
      <div class="movie-card" v-for="movie in movies" :key="movie.slug">
        <img :src="`/${movie.posterPicture}`" class="movie-poster-img" :alt="movie.movieNameChinese" loading="lazy" />
        <div class="movie-title">{{ movie.movieNameChinese }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
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
  .movie-title {
    padding: 0.8em 0.5em 0.7em 0.5em;
    color: #fff;
    text-align: center;
    font-size: 1.07rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    background: #222;
    border-radius: 0 0 14px 14px;
    min-height: 3em;
  }
</style>