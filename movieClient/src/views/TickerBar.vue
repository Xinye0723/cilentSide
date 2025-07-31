<script setup lang="ts">
/* 可以用 props 把文字或 API 取回來的公告傳進來 */
const props = defineProps<{ text?: string }>();
</script>

<template>
  <!-- 整條橫幅固定在視窗最下方 -->
  <div
    class="fixed bottom-0 left-0 w-full h-10 bg-indigo-700 text-white overflow-hidden z-50"
  >
    <!-- 跑馬燈本體：簡易無縫捲動 -->
    <p class="whitespace-nowrap animate-marquee px-4 leading-10 select-none">
      {{
        props.text ||
        "🎬  歡迎來到 MovieChat！現在買票可享 9 折優惠，詳情請洽服務台。"
      }}
    </p>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-marquee {
  animation: marquee 18s linear infinite;
}
</style>
