<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import HeaderView from "./components/headerView.vue";
import FooterView from "./components/footerView.vue";
import CarouselComponent from "./components/CarouselComponent.vue";

const route = useRoute();
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- 置頂導覽列 (固定) -->
    <div>
      <HeaderView></HeaderView>
    </div>
    <!-- 只在首頁顯示 Carousel -->
    <CarouselComponent v-if="route.name === 'home'"></CarouselComponent>

    <!-- 2️⃣ 內容區：flex-fill 把「Header ↕︎ Footer」之間的空隙全部吃掉 -->

    <body class="pt-4">
      <RouterView></RouterView>
    </body>

    <!-- 頁腳 -->
    <FooterView v-if="!$route.meta.hideFooter" />
  </div>
</template>

<style scoped>
/* 若你有全域背景或樣式可加在這 */
</style>
