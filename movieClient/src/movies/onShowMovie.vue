<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

const tags = [
  { TagId: 0, TagName: "全部" },
  { TagId: 1, TagName: "劇情" },
  { TagId: 2, TagName: "動作" },
  { TagId: 3, TagName: "動畫" },
  { TagId: 4, TagName: "冒險" },
  { TagId: 6, TagName: "驚悚" },
  { TagId: 8, TagName: "科幻" },
  { TagId: 9, TagName: "奇幻" },
  { TagId: 11, TagName: "犯罪" },
];

const activeTag = ref(0);
const movies = ref([]);
const imgBaseUrl = "https://localhost:7181/";
const router = useRouter();

// 抽籤用狀態
const showPicker = ref(false);
const pickerSwiper = ref(null);
const spinning = ref(false);
const chosen = ref(null);
// 使用「目前篩選/分頁前的來源陣列」來抽籤。你可改成 pagedMovies 或 movies。
const pickerMovies = computed(() => movies.value || []);

// 分頁狀態
const page = ref(1);
const pageSize = 10; // 每頁顯示 10 張，可自行調整
// 頁數計算
const totalPages = computed(() =>
  Math.ceil((movies.value.length || 0) / pageSize)
);
// 分頁後的資料
const pagedMovies = computed(() =>
  movies.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);
function goToPage(p) {
  page.value = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function prevPage() {
  if (page.value > 1) {
    page.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// 取得電影清單
function fetchMovies(tagId = 0) {
  let apiUrl =
    tagId === 0
      ? "https://localhost:7181/api/Movies"
      : `https://localhost:7181/api/Movies/ByTag/${tagId}`;
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      movies.value = data
        .filter((m) => m.movieStatusId === 2)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    });
}
// 點擊 chips 時
function setActiveTag(idx, tagId) {
  activeTag.value = idx;
  page.value = 1; // ⭐️ 換tag時重置頁數
  fetchMovies(tagId);
}

function onPickerReady(swiper) {
  pickerSwiper.value = swiper;
}

// 開啟 / 關閉
function openPicker() {
  showPicker.value = true;
  chosen.value = null;
  // 等 DOM 出來再讓 swiper 更新
  nextTick(() => {
    // 有時 ref.swiper 還沒好，用 pickerSwiper.value 比較保險
    const s = pickerSwiper.value || pickerSwiperRef.value?.swiper;
    if (s) {
      s.update();
      if (s.params.loop) s.slideToLoop(0, 0, false);
    }
  });
}
function closePicker() {
  showPicker.value = false;
  stopSpinTimers(); // 清掉計時
  spinning.value = false;
}

// 旋轉計時控制
let spinTimer = null;
function stopSpinTimers() {
  if (spinTimer) {
    clearTimeout(spinTimer);
    spinTimer = null;
  }
}

// 抽籤動畫：先快 → 再慢慢減速 → 停下
function startSpin() {
  if (!pickerMovies.value.length || spinning.value) return;
  const swiper = pickerSwiper.value || pickerSwiperRef.value?.swiper;
  if (!swiper) return;

  chosen.value = null;
  spinning.value = true;

  // 可調參數：越小越快、越大越慢
  const TOTAL = 7000; // 總轉動時間(ms)
  const MIN_DELAY = 22; // 一開始兩步之間的間隔(快)
  const MAX_DELAY = 200; // 收尾兩步之間的間隔(慢)
  const MIN_DUR = 1; // slideNext 過渡時間(開始)
  const MAX_DUR = 120; // slideNext 過渡時間(結尾)

  const t0 = Date.now();

  // ease-out 曲線：越到後面越慢
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const step = () => {
    if (!spinning.value) return; // 外部中止

    const elapsed = Date.now() - t0;
    const p = Math.min(1, elapsed / TOTAL); // 0 → 1
    const e = easeOutCubic(p);

    // 動態計算 delay / duration
    const delay = Math.round(MIN_DELAY + (MAX_DELAY - MIN_DELAY) * e);
    const dur = Math.round(MIN_DUR + (MAX_DUR - MIN_DUR) * e);

    swiper.slideNext(dur, true);

    if (p < 1) {
      spinTimer = setTimeout(step, delay);
    } else {
      // 停一下再定格結果
      spinTimer = setTimeout(() => {
        spinning.value = false;
        chosen.value = pickerMovies.value[swiper.realIndex];
      }, 220);
    }
  };

  // 立刻開始第一步
  clearTimeout(spinTimer);
  spinTimer = setTimeout(step, 0);
}

function spinAgain() {
  if (spinning.value) return;
  chosen.value = null;
  const s = pickerSwiper.value || pickerSwiperRef.value?.swiper;
  if (s) s.slideToLoop(0, 0, false);
  startSpin();
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
      <button
        v-for="(tag, idx) in tags"
        :key="tag.TagId"
        class="chip"
        :class="{ active: activeTag === idx }"
        @click="setActiveTag(idx, tag.TagId)"
      >
        {{ tag.TagName }}
      </button>
      <!-- 不知道 -->
      <button class="chip mystery" @click="openPicker" title="幫我抽一部">
        不知道
      </button>
    </div>
    <!-- 電影列表 -->
    <div class="movie-row d-flex flex-wrap justify-content-center fade-in">
      <div
        class="movie-card fade-in"
        v-for="(movie, idx) in pagedMovies"
        :key="movie.movieId"
        @click="goToDetail(movie.movieId)"
        style="cursor: pointer"
        :style="{ animationDelay: idx * 0.08 + 's' }"
      >
        <div class="movie-poster-wrap" style="position: relative">
          <img
            :src="imgBaseUrl + movie.posterPicture"
            class="movie-poster-img"
            :alt="movie.movieNameChinese"
          />
          <img
            v-if="movie.ratingIcon"
            :src="imgBaseUrl + movie.ratingIcon"
            class="rating-icon"
            :alt="movie.ratingDescription"
            style="
              position: absolute;
              bottom: 8px;
              left: 8px;
              width: 40px;
              height: 40px;
              z-index: 2;
            "
          />
        </div>
        <div class="movie-info">
          <div class="movie-title-ch">{{ movie.movieNameChinese }}</div>
          <div class="movie-title-en">{{ movie.movieNameEnglish }}</div>
          <div class="movie-release">
            上映日期：{{
              movie.releaseDate ? movie.releaseDate.slice(0, 10) : "-"
            }}
          </div>
        </div>
      </div>
    </div>
    <!-- 分頁按鈕 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page <= 1" class="page-arrow">
        «
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="goToPage(p)"
        :class="['page-btn', { active: page === p }]"
      >
        {{ p }}
      </button>
      <button
        @click="nextPage"
        :disabled="page >= totalPages"
        class="page-arrow"
      >
        »
      </button>
    </div>
  </div>
  <!-- 抽籤 Modal -->
  <div v-if="showPicker" class="picker-backdrop" @click.self="closePicker">
    <div class="picker-panel">
      <div class="picker-header">
        <h3>幫你選一部 🎲</h3>
        <button class="x-btn" @click="closePicker">×</button>
      </div>
      <!-- 中央輪播 -->
      <swiper
        ref="pickerSwiperRef"
        :modules="[]"
        :loop="true"
        :centered-slides="true"
        :slides-per-view="5"
        :space-between="14"
        class="picker-swiper"
        @swiper="onPickerReady"
      >
        <swiper-slide
          v-for="m in pickerMovies"
          :key="m.movieId"
          class="picker-slide"
        >
          <img :src="imgBaseUrl + m.posterPicture" :alt="m.movieNameChinese" />
        </swiper-slide>
      </swiper>

      <!-- 控制列 -->
      <div class="picker-ctrl">
        <!-- 初始：只有 Start -->
        <button
          v-if="!spinning && !chosen"
          class="picker-btn"
          :disabled="pickerMovies.length === 0"
          @click="startSpin"
        >
          START
        </button>
        <!-- 抽籤中：顯示抽籤中（防誤觸） -->
        <button v-else-if="spinning" class="picker-btn" disabled>
          抽籤中…
        </button>
        <!-- 抽完：出現「再抽一次 / 看詳細」 -->
        <template v-else>
          <button class="picker-btn ghost" @click="spinAgain">再選一次</button>
          <button class="picker-btn" @click="goToDetail(chosen?.movieId)">
            看詳情
          </button>
        </template>
      </div>

      <div v-if="chosen" class="picker-result">
        這部吧 👉 <strong>{{ chosen.movieNameChinese }}</strong>
      </div>
    </div>
  </div>
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
  background: linear-gradient(90deg, #ffd94d, #ff9f40 80%);
  color: #222;
  box-shadow: 0 2px 10px #ffd70055;
  position: relative;
}
.movie-row {
  max-width: 1600px; /* 整個區塊最多不超過1600px，居中 */
  margin: 0 auto 2rem auto; /* 自動左右留白+下方空間 */
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px; /* 卡片間距，可調整 */
}
.movie-card {
  width: 265px;
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
  height: 376px;
  object-fit: cover;
  border-radius: 18px 18px 0 0;
  background: #191a1f;
}
.movie-info {
  display: flex;
  flex-direction: column;
  height: 155px; /* 可以調整，依你片名多寡決定 */
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
  font-family: "Noto Sans TC", sans-serif;
}
.rating-icon {
  border-radius: 6px;
  box-shadow: 0 2px 8px #0008;
  background: #fff;
}
.movie-card:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 0 24px 6px #7be6fa, 0 4px 16px rgba(0, 0, 0, 0.16);
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
  animation: fadeInList 0.7s cubic-bezier(0.6, 0.8, 0.2, 1) forwards;
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
.page-btn,
.page-arrow {
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
.page-btn.active,
.page-btn:hover {
  background: #7be6fa;
  color: #17181b;
}
.page-arrow[disabled],
.page-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
/* mystery chip */
.chip.mystery {
  background: #b9c7e2;
  color: #111;
  font-weight: 800;
}

/* Picker Modal */
.picker-backdrop {
  position: fixed;
  inset: 0;
  background: #000a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.picker-panel {
  width: min(1280px, 92vw);
  background: #1f2126;
  border-radius: 16px;
  box-shadow: 0 10px 30px #000b;
  padding: 18px 18px 16px 18px;
  color: #fff;
}
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.x-btn {
  background: none;
  border: none;
  color: #9fb3d4;
  font-size: 1.6rem;
  cursor: pointer;
}
.picker-swiper {
  height: 360px;
  background: #17181c;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 14px;
}
.picker-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.picker-slide img {
  width: 230px;
  height: 330px;
  object-fit: cover;
  box-shadow: 0 6px 20px #000a;
}
.picker-ctrl {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 4px;
}
.picker-btn {
  background: linear-gradient(90deg, #ffd94d, #ff9f40 80%);
  color: #222;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px #ffb74d44;
}
.picker-btn.ghost {
  background: #2a2d37;
  color: #cde8ff;
  box-shadow: none;
}
.picker-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.picker-result {
  margin-top: 10px;
  text-align: center;
  color: #ffe287;
  font-size: 1.06rem;
}
</style>
