<script setup>
import { computed, onMounted, ref } from "vue";

const tags = ["8月", "9月", "10月", "11月", "12月"];
const activeTag = ref(0);
function setActiveTag(idx) {
  activeTag.value = idx;
}

const sortType = ref("popular");
const allMovies = ref([]); // 所有電影資料
const filteredMovies = computed(() => {
  // 取得目前的類型名稱
  const selectedTag = tags[activeTag.value];

  // 過濾電影
  let result = allMovies.value.filter((m) => m.movieStatusId === 1);
  if (selectedTag !== "全部") {
    result = result.filter((m) => m.tags?.includes(selectedTag));
  }

  // 排序邏輯
  if (sortType.value === "popular") {
    result = result
      .slice()
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  } else if (sortType.value === "latest") {
    result = result
      .slice()
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }
  return result;
});
onMounted(() => {
  fetch("https://localhost:7181/api/Movies")
    .then((res) => res.json())
    .then((data) => {
      // ✅ 只保留已上映的電影
      allMovies.value = data.filter((m) => m.movieStatusId === 1);
    });
});
</script>

<template>
  <div>
    <!-- 篩選 chips -->
    <div class="chips-row">
      <button
        v-for="(tag, idx) in tags"
        :key="tag"
        class="chip"
        :class="{ active: activeTag.value === idx }"
        @click="setActiveTag(idx)"
      >
        {{ tag }}
      </button>
    </div>
    <!-- 電影列表 -->
    <div class="movie-row d-flex flex-wrap justify-content-center">
      <div class="movie-card" v-for="movie in filteredMovies" :key="movie.slug">
        <img
          :src="`/${movie.posterPicture}`"
          class="movie-poster-img"
          :alt="movie.movieNameChinese"
        />
        <div class="movie-title">{{ movie.movieNameChinese }}</div>
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
.chip {
  border: none;
  outline: none;
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
</style>
