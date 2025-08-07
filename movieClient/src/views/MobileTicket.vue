<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const q = route.query; // 直接取網址上帶的參數
const order = q.order ?? "—";
const movie = q.movie ?? "—";
const time = q.time ?? "—";
const cinema = q.cinema ?? "—";
const seats = (q.seats ?? "").toString().split(",").filter(Boolean);
const amount = q.amount ?? "—";

function back() {
  router.push("/");
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center bg-gray-900 text-gray-100 p-6 space-y-6"
  >
    <h1 class="text-xl font-semibold">訂票資訊</h1>

    <div class="w-full max-w-sm bg-gray-800 p-6 rounded-2xl shadow space-y-3">
      <p class="flex justify-between">
        <span class="text-gray-400">訂單編號</span><span>{{ order }}</span>
      </p>
      <p class="flex justify-between">
        <span class="text-gray-400">電影</span
        ><span class="text-right">{{ movie }}</span>
      </p>
      <p class="flex justify-between">
        <span class="text-gray-400">場次時間</span><span>{{ time }}</span>
      </p>
      <p class="flex justify-between">
        <span class="text-gray-400">影廳</span><span>{{ cinema }} 號廳</span>
      </p>
      <p class="flex justify-between">
        <span class="text-gray-400">座位</span
        ><span>{{ seats.join(", ") }}</span>
      </p>
      <hr class="border-gray-600 my-2" />
      <p class="flex justify-between font-bold">
        <span>總金額</span><span>{{ amount }} 元</span>
      </p>
    </div>

    <button
      @click="back"
      class="w-full max-w-sm bg-green-600 hover:bg-green-500 py-3 rounded-2xl font-medium shadow"
    >
      返回首頁
    </button>
  </div>
</template>
