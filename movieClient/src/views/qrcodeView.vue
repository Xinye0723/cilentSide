<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBookingStore } from "@/stores/booking";
import QrcodeVue from "qrcode.vue";

// // ⚙️ 環境變數（後端 base URL）
// const apiBase = import.meta.env.VITE_API_BASE || "https://localhost:7181";

const booking = useBookingStore();
const route = useRoute();
const router = useRouter();

// 可能透過 query 傳入，或從 Pinia 取得
const orderId = (route.query.orderId as string) || booking.orderNumber || "";

// state
const loading = ref(true);
const error = ref("");
const order = ref({
  orderNumber: orderId,
  paymentTime: "",
  amount: 0,
});
const movie = ref({
  chineseName: "",
  englishName: "",
  sessionDate: "",
  sessionTime: "",
  theaterNumber: 0,
  seats: [] as string[],
});

// 1️⃣ 優先嘗試從後端以 orderId 取最新資料
onMounted(async () => {
  try {
    if (orderId) {
      const res = await fetch(`"https://localhost:7181"/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        order.value = {
          orderNumber: data.orderNumber,
          paymentTime: data.paymentTime,
          amount: data.amount,
        };
        movie.value = {
          chineseName: data.movieChineseName,
          englishName: data.movieEnglishName,
          sessionDate: data.sessionDate,
          sessionTime: data.sessionTime,
          theaterNumber: data.theaterNo,
          seats: data.seats,
        };
        loading.value = false;
        return;
      }
    }
    // 2️⃣ 若查詢失敗，使用 Pinia 快取資料作為備案
    order.value = {
      orderNumber: orderId || "暫無",
      paymentTime: new Date().toLocaleString(),
      amount: booking.ticketTotal + booking.snackTotal,
    };
    movie.value = {
      chineseName: booking.movieName,
      englishName: booking.movieNameEnglish ?? "",
      sessionDate: booking.sessionTime?.split(" ")[0] ?? "",
      sessionTime: booking.sessionTime?.split(" ")[1] ?? "",
      theaterNumber: booking.theaterNo,
      seats: booking.selectedSeats,
    };
  } catch (e: any) {
    error.value = e.message ?? "載入失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
});

// QR Code 內容：以後端驗票網址為例，可依實際需求調整
const qrValue = computed(
  () => `"https://localhost:7181"/ticket/validate/${order.value.orderNumber}`
);

// 清理並返回首頁
function goHome() {
  booking.reset?.(); // 若 store 有 reset 函式
}
</script>
<template>
  <div
    class="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4"
  >
    <h1 class="text-3xl md:text-4xl font-bold mb-8 text-center">訂單明細</h1>

    <!-- ⚠️ 載入 / 失敗狀態 -->
    <p v-if="loading" class="text-gray-400 mt-20">載入中…</p>
    <p v-else-if="error" class="text-red-400 mt-20">{{ error }}</p>

    <!-- 主要內容 -->
    <div
      v-else
      class="w-full max-w-5xl grid md:grid-cols-2 gap-6 animate-fadeIn"
    >
      <!-- 訂單 + 電影資訊 -->
      <div class="space-y-6">
        <section class="bg-gray-800 rounded-2xl shadow p-6">
          <h2
            class="text-xl font-semibold mb-4 flex items-center justify-center"
          >
            <span class="i-lucide-receipt mr-2" /> 訂單資訊
          </h2>
          <div class="space-y-1 text-base">
            <p class="flex justify-between mb-3">
              <span class="font-medium">訂單編號：</span>
              <span>{{ order.orderNumber }}</span>
            </p>
            <p class="flex justify-between">
              <span class="font-medium">交易時間：</span>
              <span>{{ order.paymentTime }}</span>
            </p>
          </div>

          <!-- 明細：票種 & 附餐 -->
          <div class="mt-6 text-base space-y-4">
            <!-- 票種明細 -->
            <div>
              <h3 class="font-medium mb-2">票種明細</h3>
              <ul class="list-disc list-inside text-sm ml-3 mt-3">
                <li
                  v-for="type in booking.ticketTypes.filter(
                    (t) => booking.ticketCounts[t.name] > 0
                  )"
                  :key="type.name"
                  class="flex justify-between"
                >
                  <span
                    >{{ type.name }} ×
                    {{ booking.ticketCounts[type.name] }}</span
                  >
                  <span
                    >{{ type.price * booking.ticketCounts[type.name] }} 元</span
                  >
                </li>
              </ul>
            </div>
            <!-- 附餐明細 -->
            <div>
              <h3 class="font-medium mb-2">附餐明細</h3>
              <ul class="list-disc list-inside text-sm ml-3 mt-3">
                <li
                  v-for="s in booking.snacks.filter((s) => s.qty > 0)"
                  :key="s.id"
                  class="flex justify-between"
                >
                  <span>{{ s.name }} × {{ s.qty }}</span>
                  <span>{{ s.price * s.qty }} 元</span>
                </li>
              </ul>
            </div>
            <p class="flex justify-between">
              <span class="font-medium">總金額</span>
              <span>{{ order.amount }} 元</span>
            </p>
          </div>
        </section>

        <!-- 電影資訊 -->
        <section class="bg-gray-800 rounded-2xl shadow p-6">
          <h2
            class="text-xl font-semibold mb-4 flex items-center gap-2 justify-center"
          >
            <span class="i-lucide-film" /> 電影資訊
          </h2>
          <div class="space-y-1 text-base">
            <p>
              <span class="font-medium">電影：</span>{{ movie.chineseName
              }}<span v-if="movie.englishName"> ({{ movie.englishName }})</span>
            </p>
            <p>
              <span class="font-medium">場次時間：</span>{{ movie.sessionDate }}
              {{ movie.sessionTime }}
            </p>
            <p>
              <span class="font-medium">影廳：</span
              >{{ movie.theaterNumber }} 號廳
            </p>
            <p>
              <span class="font-medium">座位：</span
              >{{ movie.seats.join(", ") }}
            </p>
          </div>
        </section>
      </div>

      <!-- QR Code -->
      <div
        class="flex flex-col items-center justify-center bg-gray-800 rounded-2xl shadow p-6"
      >
        <QrcodeVue :value="qrValue" :size="220" class="mb-4" />
        <p class="text-sm text-gray-400">
          請於入場前出示此 QR Code 供工作人員掃描
        </p>
      </div>
    </div>

    <!-- 影城宣導 -->
    <section
      v-if="!loading && !error"
      class="w-full max-w-5xl bg-gray-800 rounded-2xl shadow p-6 mt-8"
    >
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <span class="i-lucide-megaphone" /> 影城宣導
      </h2>
      <ul
        class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300"
      >
        <li>請勿聽信陌生人指示轉帳，防範詐騙。</li>
        <li>影片播放期間嚴禁錄影、直播或拍照，違者依法處理。</li>
        <li>入場請保持安靜，將手機調整為靜音或關機模式。</li>
        <li>食物及飲料請妥善存放，保持影廳環境整潔。</li>
        <li>如遇緊急事件，請依工作人員指示迅速離場。</li>
      </ul>
    </section>

    <div v-if="!loading && !error" class="mt-10 text-center">
      <router-link
        to="/"
        class="inline-flex items-center gap-1 bg-green-600 hover:bg-green-500 transition-colors text-white font-medium py-2 px-6 rounded-2xl shadow"
        @click="goHome"
      >
        <span class="i-lucide-home" /> 返回首頁
      </router-link>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease;
}
</style>
