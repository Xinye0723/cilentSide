<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useBookingStore } from "@/stores/booking";

interface Crumb {
  name: string;
  label: string;
  getPath: () => string;
}

const route = useRoute();
const booking = useBookingStore(); // <== 多這一行

const crumbs = computed(() => {
  // 1. 從 route、store 裡都撈
  const routeId = route.params.id;
  // booking.sessionId 有的話就用
  const movieId = route.params.id || booking.movieId;

  const config: Crumb[] = [
    { name: "home", label: "回首頁", getPath: () => "/home" },
    { name: "ticket", label: "選擇電影", getPath: () => "/ticket" },
    {
      name: "bookTicket",
      label: "選擇場次/座位",
      getPath: () => (movieId ? `/bookTicket/${movieId}` : "/ticket"),
    },
    { name: "meals", label: "附餐加購", getPath: () => "/meals" },
    { name: "orderDetail", label: "結帳", getPath: () => "/orderDetail" },
  ];
  const idx = config.findIndex((c) => c.name === route.name);
  return idx >= 0 ? config.slice(0, idx + 1) : [config[0]];
});
</script>

<template>
  <nav
    class="breadcrumb-container mb-4 pl-8 ml-20 mt-5"
    aria-label="Breadcrumb"
  >
    <ol class="flex items-center text-gray-400 text-base space-x-2">
      <li v-for="(crumb, idx) in crumbs" :key="idx" class="flex items-center">
        <router-link
          v-if="idx < crumbs.length - 1"
          :to="crumb.getPath()"
          class="flex items-center hover:text-white transition duration-200 transform hover:scale-110 hover:shadow-lg"
        >
          <span class="font-medium">{{ crumb.label }}</span>
        </router-link>
        <span v-else class="text-white font-semibold flex items-center">
          {{ crumb.label }}
        </span>
        <svg
          v-if="idx < crumbs.length - 1"
          class="w-5 h-5 text-gray-500 ml-2"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </li>
    </ol>
  </nav>
</template>
