<template>
  <!-- 外層：只處理進場淡入 & hover 放大 -->
  <div
    ref="motionWrap"
    class="hover:scale-[1.03] transition-transform duration-300"
  >
    <!-- 內層：只處理 3D Tilt -->
    <div
      ref="tiltEl"
      class="movie-card relative z-10 rounded-2xl overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur cursor-pointer"
    >
      <!-- 海報 -->
      <img
        :src="posterUrl"
        :alt="movie.movieNameChinese || movie.movieNameEnglish"
        class="w-full h-80 object-cover"
      />

      <!-- 漸層遮罩 -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
      ></div>

      <!-- 文字區 -->
      <div class="absolute bottom-0 p-4 text-white w-full">
        <h3 class="text-lg font-semibold truncate">
          {{ movie.movieNameChinese || movie.movieNameEnglish }}
        </h3>
      </div>
    </div>
    <!-- <button
      @click="order"
      class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-3"
    >
      立即訂購
    </button> -->
    <button class="button mt-3 flex items-center justify-center">
      立即訂票
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useMotion } from "@vueuse/motion";
import VanillaTilt from "vanilla-tilt";

const props = defineProps<{
  movie: {
    posterPicture: string;
    movieNameChinese?: string;
    movieNameEnglish?: string;
    movieRatingId: number;
    tags?: { name: string }[];
    id?: number; // 若有票務路由可用 id
  };
}>();

/* ---------- DOM 參考 ----------- */
const motionWrap = ref<HTMLElement | null>(null); // 外層淡入
const tiltEl = ref<HTMLElement | null>(null); // 內層 Tilt

/* ---------- 進場淡入動畫 (外層) ----------- */
useMotion(motionWrap, {
  initial: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
});

/* ---------- Tilt 初始化 (內層) ----------- */
onMounted(() => {
  if (tiltEl.value) {
    VanillaTilt.init(tiltEl.value, {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1, // 交由外層 hover 放大，這裡保持 1
      reset: true, // 滑鼠移出自動回正
      transition: true,
    });
  }
});

onUnmounted(() => {
  (tiltEl.value as any)?.vanillaTilt?.destroy?.();
});

/* ---------- 圖片 URL 處理 ----------- */
const posterUrl = computed(() =>
  props.movie.posterPicture?.startsWith("http")
    ? props.movie.posterPicture
    : `https://localhost:7181/${props.movie.posterPicture}`
);

/* ---------- 訂購按鈕動作 ----------- */
const router = useRouter();
function order() {
  // 依專案路由需求調整
  if (props.movie.id) {
    router.push(`/orderTicket/${props.movie.id}`);
  } else {
    const name =
      props.movie.movieNameEnglish || props.movie.movieNameChinese || "";
    router.push(`/orderTicket?name=${encodeURIComponent(name)}`);
  }
}
</script>

<style scoped>
.movie-card {
  backdrop-filter: blur(6px);
}
.button {
  /* ❶ 寬度改成跟父層一樣 */
  width: 100%;

  /* 原本的 fit-content 刪掉 */
  /* width: fit-content; */

  /* ❷ 調整高度（上下 padding）*/
  padding: 0.6rem 0; /* 或換成 0.5rem 都行 */

  /* 其餘原本樣式保持不動 ↓ */
  display: flex;
  cursor: pointer;
  gap: 0.4rem;
  font-weight: bold;
  border-radius: 30px;
  text-shadow: 2px 2px 3px rgb(136 0 136 / 50%);
  background: linear-gradient(
      15deg,
      #880088,
      #aa2068,
      #cc3f47,
      #de6f3d,
      #f09f33,
      #de6f3d,
      #cc3f47,
      #aa2068,
      #880088
    )
    no-repeat;
  background-size: 300%;
  color: #ffffff;
  border: none;
  background-position: left center;
  box-shadow: 0 30px 10px -20px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
}
.button:hover {
  background-size: 320%;
  background-position: right center;
}
</style>
