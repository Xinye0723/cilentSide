<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

interface Movie {
  id: number;
  posterPicture: string;
  movieNameChinese?: string;
  movieNameEnglish?: string;
  description?: string;
}

const route = useRoute();
const movie = ref<Movie | null>(null);

onMounted(async () => {
  const id = route.params.id;
  movie.value = await fetch(`/api/movies/${id}`).then((r) => r.json());
});
</script>

<template>
  <div class="max-w-screen-lg mx-auto py-10" v-if="movie">
    <h1 class="text-3xl font-bold mb-4">
      {{ movie.movieNameChinese || movie.movieNameEnglish }}
    </h1>
    <img :src="movie.posterPicture" class="w-60 mb-6 rounded-lg shadow" />
    <p class="text-gray-300 leading-relaxed">{{ movie.description }}</p>
  </div>
</template>
