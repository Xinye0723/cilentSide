<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";

const route = useRoute();
const router = useRouter();
const movie = ref([]);
const reviews = ref([]);
const movieId = route.params.movieId;
const imgBaseUrl = "https://localhost:7181/";
const anonymousNames = [
  "影迷小王", "電影狂人", "匿名觀眾", "電影達人", "看片高手",
  "光影旅人", "膠片收藏家", "銀幕粉絲", "劇情狂熱者", "獨立評論家",
  "膠片守護者", "銀幕追隨者", "午夜觀影者", "爆米花達人", "電影探險家",
  "畫面魔術師", "票房殺手", "劇情解析者", "光影獵人", "放映室常客",
  "導演迷妹", "影評小師", "劇本讀者", "幕後英雄", "視覺饗宴者"
];
const showModal = ref(false);
const newReview = ref({
  rating: 5,
  comment: ''
});
const hoverRating = ref(0);

// 產生分好行的主演陣列
const starsPerRow = 4;
const starringChunks = computed(() => {
  if (!movie.value?.starring) return [];
  const list = movie.value.starring
    .split(/,|、|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const result = [];
  for (let i = 0; i < list.length; i += starsPerRow) {
    result.push(list.slice(i, i + starsPerRow));
  }
  return result;
});

const directorList = computed(() => {
  if (!movie.value?.director) return [];
  // 可依你後端分隔符號改，這裡支援中、英文逗號
  return movie.value.director
    .split(/,|、|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
});

// 取匿名名字（依review id模長）
function getAnonymousName(reviewId, comment = "") {
  let hash = 0;
  const str = String(reviewId) + comment.length + "otherSalt";
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return anonymousNames[Math.abs(hash) % anonymousNames.length];
}

// 根據分數過濾評論
function filteredReviews(score) {
  if (!reviews.value) return [];
  return reviews.value.filter((r) => r.rating === score);
}

function setRating(score) {
  newReview.value.rating = score;
}
function setHover(score) {
  hoverRating.value = score;
}
function clearHover() {
  hoverRating.value = 0;
}

async function fetchReviews() {
  try {
    const res = await fetch(
      `https://localhost:7181/api/MovieReviews/movie/${movieId}`
    );
    if (!res.ok) throw new Error("Fetch reviews failed");
    const data = await res.json();
    reviews.value = data;
    await nextTick();
    // 如果用ref拿Swiper實例，這裡可以調用swiper.update()，必要時加入
  } catch (err) {
    console.error(err);
  }
}

async function submitReview() {
  try {
    // 準備要送出的資料，補上 movieId 與匿名 memberId
    const payload = {
      movieId: movieId,
      memberId: 1,          // 你後端預設1是匿名會員
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      isPublic: true        // 假設公開
    };

    const res = await fetch('https://localhost:7181/api/MovieReviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('新增評論失敗');

    // 送出成功，關閉彈窗，清空輸入欄位
    showModal.value = false;
    newReview.value = { rating: 5, comment: '' };

    // 重新抓取最新評論更新畫面
    await fetchReviews();
  } catch (err) {
    console.error(err);
    alert('新增評論失敗，請稍後再試');
  }
}

onMounted(async () => {
  try {
    // 先讓後端點閱次數 +1
    await fetch(`https://localhost:7181/api/Movies/${movieId}/view`, {
      method: "POST",
    });
    // 再去抓這部電影的最新資料
    const res = await fetch(`https://localhost:7181/api/Movies/${movieId}`);
    movie.value = await res.json();
    // 再抓評論資料
    await fetchReviews();
  } catch (err) {
    console.error(err);
  }
});

function goToTicket(movieId) {
  router.push(`/bookTicket/${movieId}`);
}
</script>

<template>
  <div class="movie-detail-outer">
    <div class="movie-detail-wrapper">
      <!-- 左邊電影詳情區 -->
      <div class="left-container">
        <div class="movie-detail-container">
          <div class="movie-detail-main">
            <img
              :src="imgBaseUrl + movie.posterPicture"
              class="movie-detail-poster"
              :alt="movie.movieNameChinese"
            />
            <div class="movie-detail-info">
              <h2 class="movie-title-ch">{{ movie.movieNameChinese }}</h2>
              <div class="movie-title-en">{{ movie.movieNameEnglish }}</div>
              <div class="movie-detail-meta">
                <div>類型：{{ movie.tags ? movie.tags.join("、") : "-" }}</div>
                <div>
                  分級：{{ movie.ratingDescription
                  }}{{ movie.ratingCode ? `(${movie.ratingCode})` : "" }}
                </div>
                <div>片長：{{ movie.duration }} 分鐘</div>
                <div>
                  上映日期：{{
                    movie.releaseDate ? movie.releaseDate.slice(0, 10) : "-"
                  }}
                </div>
                <div>導演：{{ directorList.join("、") }}</div>
                <div class="movie-detail-starring">
                  <template v-for="(chunk, idx) in starringChunks" :key="idx">
                    <span v-if="idx === 0">主演：{{ chunk.join("、") }}</span>
                    <span
                      v-else
                      style="display: block; text-indent: 3em; margin-left: 0"
                      >{{ chunk.join("、") }}</span
                    >
                  </template>
                </div>
                <div>製作商：{{ movie.production }}</div>
                <div>發行商：{{ movie.distributor }}</div>
                <div>產地：{{ movie.country }}</div>
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
              style="width: 100%; min-height: 500px; border-radius: 10px"
            >
            </iframe>
          </div>
  
          <div class="movie-detail-bottom">
            <button @click="$router.back()" class="btn btn-outline-secondary">
              <i class="bi bi-box-arrow-left"></i> 電影清單
            </button>
            <span class="movie-view-count"
              >點閱：{{ movie.viewCount?.toLocaleString() || 0 }}</span
            >
            <button
              class="buy-btn"
              :class="{
                upcoming: movie.movieStatusId === 1,
                off: movie.movieStatusId === 3,
              }"
              :disabled="movie.movieStatusId !== 2"
              @click.stop="movie.movieStatusId === 2 && goToTicket(movie.movieId)"
            >
              <i class="bi bi-ticket-perforated me-1"></i>
              <span v-if="movie.movieStatusId === 2">立即訂票</span>
              <span v-else-if="movie.movieStatusId === 1">敬請期待</span>
              <span v-else-if="movie.movieStatusId === 3">已下檔</span>
            </button>
          </div>
        </div>
      </div>
  
      <!-- 右邊評論區 -->
      <div class="right-container review-block">
        <div class="review-header">
          <h3 class="review-title"><i class="bi bi-chat-dots"></i> 網友評論</h3>
          <button @click="showModal = true" class="add-review-btn"><i class="bi bi-plus"></i></button>
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
            v-if="filteredReviews(score).length"
          >
            <SwiperSlide
              v-for="review in filteredReviews(score)"
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
        <!-- 新增評論彈窗 -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-content">
            <h4>新增電影評論</h4>
            <label>評分：</label>
              <div class="star-rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ filled: star <= (hoverRating || newReview.rating) }"
                  @click="setRating(star)"
                  @mouseover="setHover(star)"
                  @mouseleave="clearHover"
                >★</span>
              </div>
            <label>評論內容：</label>
            <textarea v-model="newReview.comment" rows="4" placeholder="寫下你的評論..."></textarea>
            <button @click="submitReview">送出</button>
            <button @click="showModal = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.movie-detail-outer {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh; /* 可選 */
  /* 可選：讓區塊與導覽列的距離一致 */
  margin-top: 30px;
  margin-bottom: 30px;
}
.movie-detail-wrapper {
  display: flex;
  gap: 3px;
  align-items: flex-start;
  width: 100%;
  max-width: 1600px;
}
.movie-detail-container {
  max-width: 960px;
  margin: 34px auto 70px 90px;
  color: #fff;
  font-family: "Noto Sans TC", sans-serif;
  background: #1c1d22;
  border-radius: 20px;
  border-top: 1.5px solid #324;
  box-shadow: 0 8px 32px #222b;
  padding: 38px 34px 36px 34px;
}
.movie-detail-main {
  display: flex;
  gap: 29px;
  align-items: flex-start;
}
.movie-detail-poster {
  width: 275px;
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
  font-size: 2.09em;
  font-weight: 900;
  color: #ffe480;
  margin-bottom: 3px;
}
.movie-title-en {
  font-size: 1.1em;
  color: #7be6fa;
  margin-bottom: 12px;
}
.movie-detail-meta div {
  margin-bottom: 6px;
}
.movie-detail-plot {
  text-align: justify;
}
.movie-detail-plot,
.movie-detail-trailer {
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
  color: #b9c7e2;
  font-size: 1em;
  font-weight: 700;
  margin-left: 1px;
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
.buy-btn {
  width: 13%;
  margin: 0.7em 0.1em 0em auto;
  display: block;
  background: linear-gradient(90deg, #ffd700 60%, #ff60ef 100%);
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 999px;
  padding: 8px 0 7px 0;
  box-shadow: 0 2px 12px #ffd70044;
  font-size: 1rem;
  letter-spacing: 0.06em;
  transition: all 0.2s;
}
.buy-btn:hover {
  background: linear-gradient(90deg, #ffae00 60%, #fc41f4 100%);
  color: #fff;
  box-shadow: 0 4px 18px #ffd70066;
}
.buy-btn:disabled,
.buy-btn.upcoming,
.buy-btn.off {
  background: linear-gradient(90deg, #bbb 60%, #eee 100%);
  color: #555;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}
.right-container {
  flex: 1;
  min-width: 420px;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #1c1d22;
  border-radius: 12px;
  padding: 24px;
  margin: 38px 100px 70px auto;
}
/* 行動裝置調整 */
@media (max-width: 950px) {
  .movie-detail-wrapper {
    flex-direction: column;
  }
  .left-container,
  .right-container {
    min-width: 0;
    max-width: 100%;
  }
}
.review-block {
  margin-top: 34px;
  margin-bottom: 32px;
  padding: 38px 20px 0 20px;
  border-top: 1.5px solid #324;
  max-width: 480px;
  position: relative;
}
.review-title {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 14px;
  color: #ffd76a;
}
.review-cards-group {
  margin-bottom: 32px;
}
.review-group-title {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 1.1em;
  margin-bottom: 8px;
}
.review-stars {
  color: #ffd700;
  font-size: 1.16em;
  letter-spacing: 1px;
}
.review-score-label {
  color: #fff;
  background: #393b40;
  padding: 2px 12px;
  border-radius: 16px;
  font-size: 1em;
}
.review-swiper {
  width: 315px;
  min-height: 138px;
  margin-bottom: 4px;
}
.review-card-ticket {
  min-width: 300px;
  min-height: 110px;
  background: repeating-linear-gradient(
    -45deg,
    #fffbe6,
    #fffbe6 22px,
    #fff9d7 22px,
    #fff9d7 44px
  );
  border-radius: 20px 20px 18px 18px / 30px 30px 16px 16px;
  border: 2.8px dashed #ffce59;
  box-shadow: 0 2px 16px #0005;
  padding: 22px 24px 14px 24px;
  font-size: 1.05em;
  margin-bottom: 7px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  line-height: 1.5em;
  overflow: visible;
}
.review-card-ticket > .corner-cut {
  content: "";
  position: absolute;
  width: 43px;
  height: 43px;
  background: #1c1d22; /* 頁面背景色 */
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
  margin-bottom: 6px;
}
.review-card-content {
  color: #222;
  margin-bottom: 7px;
  font-size: 1.07em;
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
  padding: 16px 10px;
  margin: 8px 0 12px 0;
  font-size: 1.02em;
  opacity: 0.83;
  text-align: center;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  background: repeating-linear-gradient(
    -45deg,
    #fffbe6,
    #fffbe6 22px,
    #fff9d7 22px,
    #fff9d7 44px
  );
  padding: 24px 28px;
  border-radius: 12px;
  border: 2.8px dashed #ffce59;
  width: 90%;
  max-width: 410px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  font-family: 'Noto Sans TC', sans-serif;
  color: #222;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-content h4 {
  margin-bottom: 12px;
  font-weight: 700;
  color: #55529a;
}

.modal-content label {
  display: block;
  margin-top: 10px;
  font-weight: 700;
  color: #555;
}

.modal-content textarea {
  width: 100%;
  margin-top: 4px;
  padding: 12px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;
}
.modal-content textarea:focus {
  outline: none;
  border-color: #ff60ef;
  box-shadow: 0 0 8px #ff60efaa;
}
.modal-content button {
  margin-top: 12px;
  margin-right: 12px;
  padding: 12px 32px;
  background: linear-gradient(90deg, #ffd700 60%, #ff60ef 100%);
  border: none;
  border-radius: 9999px;
  color: #222;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
  user-select: none;
}
.modal-content button:hover {
  background: linear-gradient(90deg, #ffae00 60%, #fc41f4 100%);
  color: #fff;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.star-rating {
  font-size: 2.2rem;
  color: #ccc;
  user-select: none;
  cursor: pointer;
  display: flex;
  gap: 5px;
  padding: 3px 0;
}
.star {
  transition: color 0.25s ease;
  padding: 2px 4px;
  border-radius: 4px;
}
.star.filled {
  color: #ffd700; /* 金黃色 */
}
textarea {
  width: 100%;
  margin-top: 1rem;
  padding: 8px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: vertical;
}
.add-review-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 25px;
  height: 25px;
  padding: 1px 1px;
  background: linear-gradient(90deg, #ffd700 60%, #ff60ef 100%);
  border: none;
  color: #222;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}
.add-review-btn:hover {
  background: linear-gradient(90deg, #ffae00 60%, #fc41f4 100%);
  color: #fff;
}
</style>
