<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { useMotion } from "@vueuse/motion";
import VanillaTilt from "vanilla-tilt";

const props = defineProps<{
  movie: {
    movieId: number;
    posterPicture: string;
    movieNameChinese?: string;
    movieNameEnglish?: string;
  };
}>();

const emit = defineEmits<{
  (e: "click", movie: typeof props.movie): void;
  (e: "book-ticket", movieId: number): void;
}>();

/* 進場淡入 */
const motionWrap = ref<HTMLElement | null>(null);
useMotion(motionWrap, {
  initial: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
});

/* 3D Tilt */
const tiltEl = ref<HTMLElement | null>(null);
onMounted(() => {
  if (tiltEl.value) {
    VanillaTilt.init(tiltEl.value, {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1,
      reset: true,
      transition: true,
    });
  }
});
onUnmounted(() => {
  (tiltEl.value as any)?.vanillaTilt?.destroy?.();
});

/* 海報 URL */
const posterUrl = computed(() =>
  props.movie.posterPicture?.startsWith("http")
    ? props.movie.posterPicture
    : `https://localhost:7181/${props.movie.posterPicture}`
);
</script>

<template>
  <div
    ref="motionWrap"
    @click="emit('click', movie)"
    class="hover:scale-[1.03] transition-transform duration-300"
  >
    <div
      ref="tiltEl"
      class="movie-card relative z-10 rounded-2xl overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur cursor-pointer"
    >
      <img
        :src="posterUrl"
        :alt="movie.movieNameChinese || movie.movieNameEnglish"
        class="w-full h-80 object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
      ></div>
      <div class="absolute bottom-0 p-4 text-white w-full">
        <h3 class="text-lg font-semibold truncate">
          {{ movie.movieNameChinese || movie.movieNameEnglish }}
        </h3>
      </div>
    </div>

    <!-- <button
      class="button mt-3 flex items-center justify-center"
      @click.stop="$emit('book-ticket', movie.id)"
    >
      立即訂票
    </button> -->
    <!-- <RouterLink
      :to="`/bookTicket/${movie.id}`"
      class="button mt-3 flex items-center justify-center"
    >
      立即訂票
    </RouterLink> -->
    <RouterLink
      :to="{ name: 'bookTicket', params: { id: movie.movieId } }"
      class="button mt-3 flex items-center justify-center"
    >
      立即訂票
    </RouterLink>
  </div>
</template>

<style scoped>
.movie-card {
  backdrop-filter: blur(6px);
}
.button {
  width: 100%;
  padding: 0.6rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
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
