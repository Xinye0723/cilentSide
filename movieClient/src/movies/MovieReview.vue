<script setup>
import { onMounted, ref, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/effect-cards";
import { Autoplay, EffectCards } from "swiper/modules";
import { useRouter } from "vue-router";

const movies = ref([]);
const router = useRouter();
const statusTab = ref(2); // 2=已上映, 3=已下檔
const imgBaseUrl = "https://localhost:7181/";
const anonymousNames = [
  "影迷小王",
  "電影狂人",
  "匿名觀眾",
  "電影達人",
  "看片高手",
  "光影旅人",
  "膠片收藏家",
  "銀幕粉絲",
  "劇情狂熱者",
  "獨立評論家",
  "膠片守護者",
  "銀幕追隨者",
  "午夜觀影者",
  "爆米花達人",
  "電影探險家",
  "畫面魔術師",
  "票房殺手",
  "劇情解析者",
  "光影獵人",
  "放映室常客",
  "導演迷妹",
  "影評小師",
  "劇本讀者",
  "幕後英雄",
  "視覺饗宴者",
];

// 依分數篩選
function filteredReviews(movie, score) {
  if (!movie || !movie.reviews) return [];
  return movie.reviews.filter((r) => r.rating === score);
}
// 匿名名稱（同你原本邏輯）
function getAnonymousName(reviewId, comment = "") {
  let hash = 0;
  const str = String(reviewId) + comment.length + "otherSalt";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return anonymousNames[Math.abs(hash) % anonymousNames.length];
}

const fetchMoviesWithReviews = async () => {
  const res = await fetch(
    `https://localhost:7181/api/Movies/WithReviews?status=${statusTab.value}`
  );
  movies.value = await res.json();
};

onMounted(fetchMoviesWithReviews);
watch(statusTab, fetchMoviesWithReviews);

function goToDetail(movieId) {
  router.push(`/movies/${movieId}`);
}
</script>

<template>
  <div class="movie-review-list">
    <div class="tab-row">
      <button :class="{ active: statusTab === 2 }" @click="statusTab = 2">
        已上映
      </button>
      <button :class="{ active: statusTab === 3 }" @click="statusTab = 3">
        已下檔
      </button>
    </div>
    <Swiper
      v-if="movies.length"
      ref="swiperRef"
      :modules="[Autoplay]"
      direction="vertical"
      :freeMode="true"
      :observer="true"
      :observe-parents="true"
      :autoplay="{
        delay: 1,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }"
      :loop="true"
      :speed="1500"
      :allowTouchMove="false"
      class="credit-swiper"
      :slides-per-view="3"
      :space-between="10"
      style="height: 800px"
    >
      <swiper-slide v-for="movie in movies" :key="movie.movieId">
        <div class="movie-review-row">
          <!-- 左側：電影卡片資料 -->
          <div class="movie-card-left">
            <img
              :src="imgBaseUrl + movie.posterPicture"
              class="poster"
              @click="goToDetail(movie.movieId)"
              style="cursor: pointer"
            />
            <div class="title-ch">
              {{
                movie.movieNameChinese.length > 9
                  ? movie.movieNameChinese.slice(0, 9)
                  : movie.movieNameChinese
              }}
            </div>
            <!-- <div class="title-en">{{ movie.movieNameEnglish }}</div> -->
          </div>
          <!-- 右側：橫向評論 swiper -->
          <div class="review-groups">
            <div class="review-header">
              <h3 class="review-title">
                <i class="bi bi-chat-dots"></i> 網友評論
              </h3>
            </div>
            <div
              class="review-cards-group"
              v-for="score in [5, 4, 3, 2, 1]"
              :key="score"
            >
              <div class="review-group-title">
                <span class="review-stars">{{
                  "★".repeat(score) + "☆".repeat(5 - score)
                }}</span>
                <span class="review-score-label">{{ score }}分</span>
              </div>
              <Swiper
                :modules="[EffectCards]"
                effect="cards"
                grab-cursor="true"
                class="review-swiper"
                v-if="filteredReviews(movie, score).length"
              >
                <SwiperSlide
                  v-for="review in filteredReviews(movie, score)"
                  :key="review.movieReviewId"
                >
                  <div class="review-card-ticket">
                    <div class="corner-cut corner-top-left"></div>
                    <div class="review-card-user">
                      <i class="bi bi-person-circle"></i>
                      {{ getAnonymousName(review.movieReviewId) }}
                    </div>
                    <div class="review-card-content">{{ review.comment }}</div>
                    <div class="review-card-date">
                      {{ new Date(review.reviewedAt).toLocaleDateString() }}
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
              <div v-else class="review-card-empty">暫無{{ score }}分評論</div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </Swiper>
  </div>
</template>

<style lang="css" scoped>
.movie-review-list {
  padding: 20px 0;
}
.tab-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}
.tab-row button {
  background: #222;
  color: #ffd94d;
  font-weight: bold;
  font-size: 1.1em;
  border: none;
  border-radius: 16px 16px 0 0;
  padding: 10px 30px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tab-row button.active {
  background: linear-gradient(90deg, #ffd94d, #ff9f40 80%);
  color: #222;
}
.movie-review-row {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  background: #21232b;
  border-radius: 14px;
  margin: 0 28px 0 20px;
  padding: 20px 35px 10px 20px;
  box-shadow: 0 2px 16px #0004;
}
.movie-card-left {
  min-width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.poster {
  width: 140px;
  height: 200px;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0008;
  margin-bottom: 10px;
  transition: transform 0.18s;
}
.poster:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 6px 24px #7be6fa;
}
.title-ch {
  font-size: 1em;
  font-weight: 900;
  color: #fff;
  text-align: center;
  margin-bottom: 1px;
}
.title-en {
  color: #7be6fa;
  font-size: 0.99em;
  text-align: center;
  margin-bottom: 1px;
}
.title-ch,
.title-en {
  word-break: break-all;
  white-space: normal;
  /* 或直接 max-width: 100px;，讓長片名換行 */
  max-width: 150px;
}
.review-groups {
  display: flex;
  gap: 42px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.review-header {
  margin-bottom: 2px;
}
.review-title {
  font-size: 1.15em;
  font-weight: bold;
  color: #ffd76a;
  margin-bottom: 7px;
  letter-spacing: 0.1px;
}
.review-group-title {
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: 1.04em;
  margin-bottom: 5px;
}
.review-stars {
  color: #ffd700;
  font-size: 1.1em;
  letter-spacing: 3px;
}
.review-score-label {
  color: #fff;
  background: #393b40;
  padding: 2px 12px;
  border-radius: 16px;
  font-size: 0.99em;
}
.review-swiper {
  width: 100%;
  max-width: 250px;
  min-width: 0;
  min-height: 140px;
  margin-bottom: 6px;
}
.review-swiper :deep(.swiper-slide) {
  margin-right: 10px;
}
.review-card-ticket {
  min-width: 200px;
  max-width: 240px;
  width: 100%;
  background: repeating-linear-gradient(
    -45deg,
    #fffbe6,
    #fffbe6 22px,
    #fff9d7 22px,
    #fff9d7 44px
  );
  border-radius: 20px 20px 18px 18px / 30px 30px 16px 16px;
  border: 2.6px dashed #ffce59;
  box-shadow: 0 2px 16px #0005;
  padding: 20px 20px 10px 24px;
  font-size: 1.05em;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  line-height: 1.5em;
  overflow: visible;
  position: relative;
}
.review-card-ticket > .corner-cut {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;
  background: #21232b;
  border-radius: 50%;
  z-index: 2;
}
.review-card-ticket > .corner-top-left {
  top: -11px;
  left: -11px;
}
.review-card-user {
  font-weight: bold;
  color: #55529a;
  margin-bottom: 5px;
  font-size: 1.03em;
}
.review-card-content {
  color: #222;
  margin-bottom: 1px;
  font-size: 1em;
  text-align: justify;
}
.review-card-date {
  font-size: 0.93em;
  color: #8c8c8c;
  text-align: right;
}
.review-card-empty {
  color: #a5a5a5;
  background: #242424;
  border-radius: 14px;
  padding: 13px 10px;
  margin: 5px 0 12px 0;
  font-size: 1.01em;
  opacity: 0.83;
  text-align: center;
}
/* RWD: 行動裝置簡單排版 */
@media (max-width: 900px) {
  .movie-review-row {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 5vw;
    margin: 0 4vw 22px 4vw;
    gap: 24px;
  }
  .movie-review-list {
    padding: 14px 0;
  }
  .poster {
    width: 80px;
    height: 116px;
  }
  .review-swiper {
    width: 97vw;
    min-width: 0;
    max-width: 99vw;
  }
}
</style>
