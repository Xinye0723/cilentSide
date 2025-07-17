<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

    const route = useRoute();
    const movie = ref([]);
    const imgBaseUrl = 'https://localhost:7181/';
    // 幾個一行
    const starsPerRow = 3;

    // 產生分好行的主演陣列
    const starringChunks = computed(() => {
        if (!movie.value?.starring) return [];
        const list = movie.value.starring.split(/,|、|\n/).map(s => s.trim()).filter(Boolean);
        const result = [];
        for (let i = 0; i < list.length; i += starsPerRow) {
            result.push(list.slice(i, i + starsPerRow));
        }
        return result;
    });

    onMounted(() => {
        fetch(`https://localhost:7181/api/Movies/${route.params.movieId}`)
        .then(res => res.json())
        .then(data => {
            movie.value = data;
        });
    });
</script>

<template>
    <div class="movie-detail-container">
    <div class="movie-detail-main">
      <img :src="imgBaseUrl + movie.posterPicture" class="movie-detail-poster" :alt="movie.movieNameChinese" />
<!-- 劇照輪播 -->
      <div class="movie-detail-info">
        <h2 class="movie-title-ch">{{ movie.movieNameChinese }}</h2>
        <div class="movie-title-en">{{ movie.movieNameEnglish }}</div>
        <div class="movie-detail-meta">
          <div>類型：</div>
          <div>分級：{{ movie.ratingDescription }}{{ movie.ratingCode ? `(${movie.ratingCode})` : '' }}</div>
          <div>片長：{{ movie.duration }} 分鐘</div>
          <div>上映日期：{{ movie.releaseDate ? movie.releaseDate.slice(0,10) : '-' }}</div>
          <div>導演：{{ movie.director }}</div>
          <div class="movie-detail-starring">
            <template v-for="(chunk, idx) in starringChunks" :key="idx">
                <span v-if="idx === 0">主演：{{ chunk.join('、') }}</span>
                <span v-else style="display: block; text-indent: 3em; margin-left: 0;">{{ chunk.join('、') }}</span>
            </template>
          </div>
          <div>製作商：{{ movie.production }}</div>
          <div>發行商：{{ movie.distributor }}</div>
          <div>國家：{{ movie.country }}</div>
        </div>
      </div>
    </div>

    <div class="movie-detail-plot">
      <div class="section-title">劇情簡介</div>
      <div>{{ movie.plot }}</div>
    </div>

    <div v-if="movie.trailerUrl" class="movie-detail-trailer">
      <div class="section-title">預告片</div>
      <iframe
        :src="movie.trailerUrl"
        frameborder="0"
        allowfullscreen
        style="width:100%;min-height:500px;border-radius:10px;"
      ></iframe>
    </div>

    <div class="movie-detail-bottom">
      <button @click="$router.back()" class="btn btn-outline-secondary">電影清單</button>
      <span class="movie-view-count">點閱：{{ movie.viewCount || 0 }}</span>
    </div>
  </div>
</template>

<style lang="css" scoped>
.movie-detail-container {
  max-width: 960px;
  margin: 38px auto 70px auto;
  color: #fff;
  font-family: 'Noto Sans TC', sans-serif;
  background: #1c1d22;
  border-radius: 20px;
  box-shadow: 0 8px 32px #222b;
  padding: 38px 34px 36px 34px;
}
.movie-detail-main {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.movie-detail-poster {
  width: 260px;
  min-width: 180px;
  border-radius: 16px;
  box-shadow: 0 4px 18px #000c;
  background: #23232a;
}
.movie-detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 1.08rem;
  min-width: 0;
}
.movie-title-ch {
  font-size: 2.1em;
  font-weight: 900;
  color: #ffe480;
  margin-bottom: 3px;
}
.movie-title-en {
  font-size: 1.05em;
  color: #7be6fa;
  margin-bottom: 12px;
}
.movie-detail-meta div {
  margin-bottom: 6px;
}
.movie-detail-plot, .movie-detail-trailer {
  margin-top: 34px;
  padding: 20px 0 0 0;
  border-top: 1px solid #234;
}
.section-title {
  font-size: 1.16em;
  font-weight: 700;
  color: #ffe287;
  margin-bottom: 9px;
  letter-spacing: 2px;
}
.movie-detail-bottom {
  display: flex;
  align-items: center;
  margin-top: 30px;
  gap: 20px;
}
.movie-view-count {
  color: #ffe287;
  font-size: 1.1em;
  font-weight: 700;
  margin-left: 18px;
}
@media (max-width: 768px) {
  .movie-detail-main {
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
  .movie-detail-poster {
    width: 60vw;
    max-width: 300px;
  }
  .movie-detail-container {
    padding: 16px 6vw;
  }
}
</style>