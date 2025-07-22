<template>
  <nav class="breadcrumb-container mb-4 pl-8 ml-20" aria-label="Breadcrumb">
    <ol class="flex items-center text-gray-400 text-base space-x-2">
      <li v-for="(crumb, idx) in crumbs" :key="idx" class="flex items-center">
        <!-- 可點擊項目 -->
        <a
          v-if="idx < crumbs.length - 1"
          :href="crumb.getPath()"
          class="flex items-center hover:text-white transition duration-200 transform hover:scale-110 hover:shadow-lg"
        >
          <span class="font-medium">{{ crumb.label }}</span>
        </a>
        <!-- 當前頁面 -->
        <span v-else class="text-white font-semibold flex items-center">
          {{ crumb.label }}
        </span>

        <!-- 分隔箭頭（最後一項不需要）-->
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

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

interface Crumb {
  name: string;
  label: string;
  getPath: () => string;
}

const route = useRoute();
// 預設麵包屑配置
const config: Crumb[] = [
  { name: "home", label: "回首頁", getPath: () => "/home" },
  { name: "ticket", label: "選擇電影", getPath: () => "/ticket" },
  {
    name: "bookTicket",
    label: "選擇場次/座位",
    getPath: () => `/ticket/book/${route.params.id}`,
  },
  { name: "meals", label: "附餐加購", getPath: () => "/ticket/meals" },
  { name: "orderDetail", label: "結帳", getPath: () => "/ticket/order" },
];

const crumbs = computed(() => {
  // 找到當前路由在配置中的索引，顯示從頭到當前路由的項目
  const idx = config.findIndex((c) => c.name === route.name);
  return idx >= 0 ? config.slice(0, idx + 1) : [config[0]];
});
</script>

<style scoped>
.breadcrumb-container {
  margin-top: 1rem;
  padding-left: 1.5rem; /* 增加左側空白 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
