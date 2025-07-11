<script setup>
import { RouterLink, RouterView } from "vue-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import HeaderView from "./components/headerView.vue";
import FooterView from "./components/footerView.vue";
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- 置頂導覽列 (固定) -->
    <HeaderView />

    <!-- 內容區：放路由切換的畫面 -->
    <main class="flex-fill pt-4">
      <RouterView />
    </main>

    <!-- 頁腳 -->
    <FooterView />
  </div>
</template>

<style scoped>
/* 若你有全域背景或樣式可加在這 */
</style>
