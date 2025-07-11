<script setup>
import { ref, onMounted } from "vue";
import MovieCard from "@/components/MovieCard.vue";
import { useRouter } from "vue-router";

const movies = ref([]);
const router = useRouter();

onMounted(async () => {
  movies.value = await fetch("/api/movies/now").then((r) => r.json());
});

function gotoDetail(movie) {
  router.push({ name: "MovieDetail", params: { id: movie.id } });
}
</script>

<template>
  <section class="container mx-auto px-4 py-8">
    <div
      class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <MovieCard
        v-for="m in movies"
        :key="m.movieId"
        :movie="m"
        @click="gotoDetail(m)"
      />
    </div>
  </section>
</template>
