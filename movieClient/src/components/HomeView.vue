<script setup>
import HotEventsCube from "@/movies/HotEventsCube.vue";
import MovieSwiper from "@/movies/MovieSwiper.vue";
import { ref } from "vue";

const apiUrl = "https://localhost:7181/api/Movies";
const imgBaseUrl = "https://localhost:7181/";
const movies = ref([]);
const nowShowing = ref([]);
const comingSoon = ref([]);
const activedIndex = ref(0);
const selectedIndex = ref(0);

fetch(apiUrl)
  .then((response) => response.json())
  .then((datas) => {
    const sorted = datas.sort((a, b) => a.displayOrder - b.displayOrder);
    movies.value = datas;
    // 依照 DisplayOrder 排序
    nowShowing.value = sorted
      .filter((movie) => movie.movieStatusId === 2)
      .slice(0, 9);
    comingSoon.value = sorted
      .filter((movie) => movie.movieStatusId === 1)
      .slice(0, 9);
  });

const tabs = ref([
  { name: "現正熱映", data: nowShowing },
  { name: "即將上映", data: comingSoon },
]);

const setActive = (idx) => {
  activedIndex.value = idx;
  selectedIndex.value = 0; // 每次切tab自動回到第0張
};

// 只要 Swiper 滑動就同步
const onSlideChange = (idx) => {
  selectedIndex.value = idx;
};
</script>

<template>
  <div class="movie-row">
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" v-for="(tab, idx) in tabs" :key="tab.name">
        <a
          class="nav-link"
          :class="{ active: activedIndex === idx }"
          href="#"
          @mouseover="setActive(idx)"
          >{{ tab.name }}</a
        >
      </li>
    </ul>
    <MovieSwiper
      :movies="tabs[activedIndex].data"
      :img-base-url="imgBaseUrl"
      :selected-index="selectedIndex"
      @slide-change="onSlideChange"
    />
  </div>
  <br />
  <HotEventsCube />
</template>

<style lang="css" scoped>
.nav-link {
  color: white;
}
.nav-tabs .nav-link.active {
  border-bottom: 3px solid white;
  color: #ffec90;
  font-weight: bold;
  background: transparent;
}
.movie-row {
  max-width: 1450px; /* 跟下方卡片容器寬度一致 */
  margin: 0 auto;
  padding-left: 10px;
  padding-right: 10px;
}
</style>
