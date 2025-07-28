<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { nextTick, ref, watch } from 'vue';
import { EffectCoverflow } from 'swiper/modules';
import { useRouter } from 'vue-router';

  const props = defineProps({
    movies: Array,
    imgBaseUrl: String,
  });

  const swiperRef = ref(null);
  const activeIndex = ref(4);  // 預設中間
  const summaryOpen = ref(false);  // 只判斷有沒有打開
  const router = useRouter();

  // 點擊事件
  function onPosterClick(idx) {
    if (idx === activeIndex.value) {
      // 只有中間那張可展開 summary
      summaryOpen.value = !summaryOpen.value
    } else {
      // 滑動到點擊的那張
      swiperRef.value?.swiper?.slideToLoop(idx, 400)
    }
  }
  // Swiper 變動
  function onSlideChange(swiper) {
    activeIndex.value = swiper.realIndex;
  }

  function truncatePlot(str, len = 56) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '......' : str;
  }
  function goToDetail(movieId) {
    router.push(`/movies/${movieId}`);
  }
  function goToTicket(id) {
    router.push(`/bookTicket/${id}`);
  }

  let speechTimer = null; // 定時器全域變數
  function playAudio(chinese, english) {
    // 停止現有語音（避免重複）
    window.speechSynthesis.cancel();
    // 有些瀏覽器 voices 會空陣列，要先觸發一次
    let voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
      };
    }
    // 找出中文女聲
    const zhVoice = voices.find(v => v.lang.startsWith('zh') && (!v.gender || v.gender === 'female' || v.name.includes('女')));
    // 找出英文女聲
    const enVoice = voices.find(v => v.lang.startsWith('en') && (!v.gender || v.gender === 'female' || v.name.toLowerCase().includes('female')));

    // 中文
    if (chinese) {
      const utterZh = new SpeechSynthesisUtterance(chinese);
      utterZh.lang = 'zh-TW';
      if (zhVoice) utterZh.voice = zhVoice;
      window.speechSynthesis.speak(utterZh);
      // wait until finish then唸英文
      utterZh.onend = () => {
        if (english) {
          const utterEn = new SpeechSynthesisUtterance(english);
          utterEn.lang = 'en-US';
          if (enVoice) utterEn.voice = enVoice;
          window.speechSynthesis.speak(utterEn); // 播放語音
        }
      };
    } else if (english) {
      // 只有英文
      const utterEn = new SpeechSynthesisUtterance(english);
      utterEn.lang = 'en-US';
      if (enVoice) utterEn.voice = enVoice;
      window.speechSynthesis.speak(utterEn); // 播放語音
    }
  }
  
  // 保證資料變更時 Swiper 重新渲染
  watch(
    () => [summaryOpen.value, activeIndex.value],
    ([open, idx], [oldOpen, oldIdx]) => {
      // 切換或開關時清掉之前定時器＋語音
      if (speechTimer) {
        clearTimeout(speechTimer);
        speechTimer = null;
      }
      window.speechSynthesis.cancel();
      
      if (open && (open !== oldOpen || idx !== oldIdx)) {
        const movie = props.movies[idx];
        if (movie) {
          // 延遲 1 秒再念
          speechTimer = setTimeout(() => {
            playAudio(movie.movieNameChinese, movie.movieNameEnglish);
          }, 1000);
        }
      }
    }
  );
</script>

<template>
  <!-- 保證有資料才渲染 swiper -->
  <swiper ref="swiperRef" :slides-per-view="Math.min(movies.length, 4.2)" :centered-slides="true" :loop="movies.length > 4" 
          :initial-slide="4" @slideChange="onSlideChange" class="movie-carousel" v-if="movies && movies.length" 
          :modules="[EffectCoverflow]" effect="coverflow" :coverflow-effect="{rotate: 35, stretch: 0, depth: 180, modifier: 1, 
          slideShadows: false}">
    <swiper-slide v-for="(movie, idx) in movies" :key="movie.movieId" :class="{ 'center-slide': activeIndex === idx }">
      <div class="flip-card" :class="{ flipped: summaryOpen && activeIndex === idx }" @click="onPosterClick(idx)">
        <div class="flip-card-inner">
          <!-- 正面：海報與訂票 -->
          <div class="flip-card-front">
            <div class="poster-frame">
              <img :src="imgBaseUrl + movie.posterPicture" :class="slide-poster" draggable="false" />
            </div>
            <button class="buy-btn" @click.stop="goToTicket(id)">
              <i class="bi bi-ticket-perforated me-1"></i>立即訂票
            </button>
          </div>
          <!-- 背面：電影詳情 -->
          <div class="flip-card-back" :style="{ background: 
                                      `linear-gradient(120deg, rgba(32,33,37,0.86) 80%, rgba(44,49,66,0.87) 100%),
                                      url('${imgBaseUrl + movie.posterPicture}') center center / cover no-repeat`}">
            <img v-if="movie.ratingIcon" :src="imgBaseUrl + movie.ratingIcon" class="rating-icon" :alt="movie.ratingDescription" 
                style="position: absolute; bottom: 60px; left: 16px; width: 40px; height: 40px; z-index: 3;" />
            <div class="summary-title-ch">{{ movie.movieNameChinese }}</div>
            <div class="summary-title-en">{{ movie.movieNameEnglish }}</div>
            <div class="summary-meta">片長：{{ movie.duration || '-' }} 分鐘</div>
            <div class="summary-meta">導演：{{ movie.director }}</div>
            <div class="summary-meta">製作商：{{ movie.production }}</div>
            <div class="summary-meta">產地：{{ movie.country }}</div>
            <div class="summary-desc">
              {{ truncatePlot(movie.plot, 56) }}
              <span v-if="movie.plot">
                <button class="detail-link" @click.stop="goToDetail(movie.movieId)">詳細介紹</button>
              </span>
            </div>
            <!-- 底部固定區塊 -->
            <div class="summary-bottom">
              <div class="summary-date">
                上映日期：{{ movie.releaseDate ? movie.releaseDate.slice(0,10) : '-' }}
              </div>
              <button class="buy-btn" @click.stop="goToTicket(id)">
                <i class="bi bi-ticket-perforated me-1"></i>立即訂票
              </button>
            </div>
            <!-- 語音播放 -->
            <button @click="playAudio(movie.movieNameChinese, movie.movieNameEnglish)"></button>
          </div>
        </div>
      </div>
    </swiper-slide>
  </swiper>
  <!-- 載入中訊息 -->
  <div v-else style="color:#aaa;text-align:center;padding:2em;">載入中...</div>
</template>

<style lang="css" scoped>
.movie-carousel {
  width: 100%;
  margin: 0 auto;
}
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: transparent;
  z-index: 1;
  position: relative;
  overflow: visible !important;
}
.swiper-slide-active {
  z-index: 10 !important;
}
.flip-card {
  width: 285px;
  height: 470px;
  perspective: 1200px;
  cursor: pointer;
  position: relative;
}
.flip-card-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.55s cubic-bezier(.6,.1,.39,1.3);
  transform-style: preserve-3d;
  position: relative;
}
.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%; height: 100%;
  left: 0; top: 0;
  backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flip-card-front {
  background: #21222a;
  z-index: 1;
  justify-content: flex-end;
}
.flip-card-back {
  background: 
    linear-gradient(120deg, rgba(32,33,37,0.82) 80%, rgba(44,49,66,0.85) 100%),
    url('${imgBaseUrl}') center center / cover no-repeat;
  color: #fff;
  transform: rotateY(180deg);
  padding: 18px 18px 14px 18px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  position: relative;
}
.poster-frame {
  width: 285px;
  height: 410px;
  background: #222;       /* 預設底色 */
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}
.slide-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;      /* 或 contain，看你想裁切還是留白 */
  border-radius: 8px;
  transition: box-shadow 0.2s;
}
.swiper-slide.center-slide .poster-frame {
  cursor: pointer;
}
.swiper-slide:not(.center-slide) .flip-card {
  cursor: default;
}
.summary-title-ch {
  font-weight: bold;
  font-size: 1.3em;
  margin-bottom: 2px;
  color: #ffe287;
}
.summary-title-en {
  color: #b9c7e2;
  font-size: 1em;
  margin-bottom: 10px;
}
.summary-meta {
  font-size: 0.97em;
  color: #fff;
  margin-bottom: 5px;
}
.summary-desc {
  font-size: 0.97em;
  background: rgba(30,32,50,0.24);
  color: #fff;
  line-height: 1.7;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: unset;
}
.detail-link {
  background: none;
  border: none;
  color: gray;
  cursor: pointer;
  font-size: 1em;
  margin-left: 2px;
  text-decoration: underline;
}
.detail-link:hover {
  color: #44b3fa;
  text-decoration: underline;
}
.summary-bottom {
  width: 100%;
  margin-top: auto;      /* 將整個區塊推到底部 */
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 日期靠右，按鈕居中/靠右可調 */
  gap: 10px;
  padding-bottom: 1px;
}
.summary-date {
  font-size: 1em;
  color: #7be6fa;
  align-self: flex-end;  /* Align right */
  font-weight: bold;
}
.rating-icon {
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 2px 8px #0008;
}
.buy-btn {
  width: 40%;
  margin: 0.7em auto 1em auto;
  display: block;
  background: linear-gradient(90deg,#ffd700 60%,#ff60ef 100%);
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 999px;
  padding: 8px 0 7px 0;
  box-shadow: 0 2px 12px #ffd70044;
  font-size: 1rem;
  letter-spacing: 0.06em;
  transition: all 0.2s;
  cursor: pointer;
}
.buy-btn:hover {
  background: linear-gradient(90deg,#ffae00 60%,#fc41f4 100%);
  color: #fff;
  box-shadow: 0 4px 18px #ffd70066;
}
.flip-card-back .buy-btn {
  margin-top: auto;  /* <-- 這一行讓背面的按鈕永遠在最底 */
  margin-bottom: 1px;  /* 跟下緣的間距可自調 */
}
</style>