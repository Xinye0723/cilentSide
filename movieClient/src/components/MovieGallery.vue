<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import MovieCard from "@/components/MovieCard.vue";

/* ===== 取得電影 ===== */
interface Movie {
  movieId: number;
  posterPicture: string;
  movieNameChinese?: string;
  movieNameEnglish?: string;
  movieRatingId: number;
  tags?: { name: string }[];
}
const movies = ref<Movie[]>([]);
onMounted(async () => {
  movies.value = await fetch("/api/movies/now").then((r) => r.json());

  window.addEventListener("mousemove", handleMove);
});
onUnmounted(() => window.removeEventListener("mousemove", handleMove));

/* ===== 搜尋 ===== */

const keyword = ref("");
const filtered = computed(() =>
  !keyword.value.trim()
    ? movies.value
    : movies.value.filter((m) =>
        (m.movieNameChinese + m.movieNameEnglish)
          .toLowerCase()
          .includes(keyword.value.trim().toLowerCase())
      )
);
watch(keyword, () => {
  currentPage.value = 1;
});
/* ===== 分頁 ===== */
const pageSize = 10;
const currentPage = ref(1);
const pageCount = computed(() => Math.ceil(filtered.value.length / pageSize));
const pagedMovies = computed(() =>
  filtered.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize
  )
);
function go(p: number) {
  if (p >= 1 && p <= pageCount.value) currentPage.value = p;
}

/* ===== 滑鼠跟隨標題 ===== */
const mouseX = ref(0),
  mouseY = ref(0);
function handleMove(e: MouseEvent) {
  mouseX.value = e.pageX;
  mouseY.value = e.pageY;
}
const titleStyle = computed(() => {
  const traX = (4 * mouseX.value) / 570 + 40;
  const traY = (4 * mouseY.value) / 570 + 50;
  return { backgroundPosition: `${traX}% ${traY}%` };
});
</script>

<template>
  <div class="flex items-center mt-10 mb-6">
    <!-- 標題：填滿中間、文字置中 -->
    <h2 class="title flex-1 text-center" :style="titleStyle">現正熱映</h2>
  </div>

  <!-- 卡片 Grid -->
  <div class="max-w-screen-xl mx-auto px-4">
    <!-- 搜尋框：推到容器最右 -->
    <input
      v-model="keyword"
      type="text"
      placeholder="搜尋電影"
      class="ml-auto block w-64 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none mb-3"
    />

    <!-- 卡片 Grid -->
    <div class="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2 gap-8">
      <MovieCard v-for="m in pagedMovies" :key="m.movieId" :movie="m" />
    </div>
  </div>

  <!-- 分頁 -->
  <div
    v-if="pageCount > 1"
    class="flex justify-center gap-2 mt-8 select-none mb-3"
  >
    <button
      :disabled="currentPage === 1"
      @click="go(currentPage - 1)"
      class="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
    >
      <i class="bi bi-arrow-left"></i>
    </button>

    <button
      v-for="p in pageCount"
      :key="p"
      @click="go(p)"
      :class="[
        'px-3 py-1 rounded',
        p === currentPage
          ? 'bg-red-500 text-white'
          : 'bg-gray-700 text-gray-200',
      ]"
    >
      {{ p }}
    </button>

    <button
      :disabled="currentPage === pageCount"
      @click="go(currentPage + 1)"
      class="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
    >
      <i class="bi bi-arrow-right"></i>
    </button>

    <div class="text-gray-400 my-auto ml-4">
      共 {{ filtered.length }} 部 • 第 {{ currentPage }} / {{ pageCount }} 頁
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Raleway:800,900");

/* Rainbow Nebula Text */
.title {
  font-family: "Raleway", sans-serif;
  font-weight: 800;
  font-size: 70px;
  line-height: 1;
  letter-spacing: 1px;
  color: transparent;

  background: url("https://phandroid.s3.amazonaws.com/wp-content/uploads/2014/05/rainbow-nebula.jpg")
    repeat;
  background-position: 40% 50%;
  -webkit-background-clip: text;

  user-select: none;
}
</style>
