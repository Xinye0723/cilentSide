<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import QrcodeVue from "qrcode.vue";
import { useBookingStore } from "@/stores/booking";

const booking = useBookingStore();
const route = useRoute();
const router = useRouter();
const orderId = (route.query.orderId as string) || booking.orderNumber;

/* ---------- 畫面狀態 ---------- */
const loading = ref(true);
const error = ref("");

/* ---------- 訂單 / 電影 ---------- */
const order = ref({ orderNumber: orderId, paymentTime: "", amount: 0 });
interface MovieInfo {
  chineseName: string;
  englishName: string;
  sessionDate: string;
  sessionTime: string;
  theaterNumber: number;
  seats: string[];
}
const movie = ref<MovieInfo>({
  chineseName: "",
  englishName: "",
  sessionDate: "",
  sessionTime: "",
  theaterNumber: 0,
  seats: [],
});

/* ---------- 明細（★ 型別改成陣列物件） ---------- */
interface TicketLine {
  type: string;
  qty: number;
  price: number;
  sub: number;
}
interface SnackLine {
  name: string;
  qty: number;
  price: number;
  sub: number;
}

const ticketLines = ref<TicketLine[]>([]);
const snackLines = ref<SnackLine[]>([]);

/* ---------- 掛載抓單 ---------- */
onMounted(async () => {
  try {
    const res = await fetch(`https://localhost:7181/api/orders/${orderId}`);
    if (!res.ok) throw new Error("查無訂單");
    const data = await res.json();

    order.value = {
      orderNumber: data.orderNo,
      paymentTime: new Date(data.createTime).toLocaleString(),
      amount: data.totalPrice,
    };

    // movie.value = {
    //   chineseName: booking.movieName || "未知",
    //   sessionDate: booking.sessionTime.split(" ")[0] || "",
    //   sessionTime: booking.sessionTime.split(" ")[1] || "",
    //   theaterNumber: booking.theaterNo,
    //   seats: (data.seats ?? []).map((s: any) => `${s.seatRow}${s.seatNumber}`),
    // };
    movie.value = {
      chineseName: data.movieChineseName ?? "未知",
      englishName: data.movieEnglishName,
      sessionDate: data.sessionDate ?? "",
      sessionTime: data.sessionTime?.substring(11, 16) ?? "", // 把 '2025-07-15T14:00:00' 取出 14:00
      theaterNumber: data.theaterNo ?? 0,
      seats: (data.seats ?? []).map((s: any) => `${s.seatRow}${s.seatNumber}`),
    };

    ticketLines.value = (data.tickets ?? []).map((t: any) => ({
      type: t.ticketType,
      qty: t.qty,
      price: t.unitPrice,
      sub: t.subTotal,
    }));

    snackLines.value = (data.snacks ?? []).map((s: any) => ({
      name: s.snackName,
      qty: s.qty,
      price: s.unitPrice,
      sub: s.subTotal,
    }));
  } catch (e: any) {
    console.error(e);
    error.value = e.message || "載入失敗";
  } finally {
    loading.value = false;
  }
});

/* ---------- QR Code ---------- */
const qrValue = computed(
  () => `${window.location.origin}/mobileTicket?orderId=${orderId}`
);

/* ---------- 返回首頁 ---------- */
function goHome() {
  booking.reset?.();
  router.push("/");
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4"
  >
    <h1 class="text-3xl md:text-4xl font-bold mb-8 text-center">訂單明細</h1>

    <!-- ⚠️ 載入 / 失敗 -->
    <p v-if="loading" class="text-gray-400 mt-20">載入中…</p>
    <p v-else-if="error" class="text-red-400 mt-20">{{ error }}</p>

    <!-- ▼ 正常內容 -->
    <div
      v-else
      class="w-full max-w-5xl grid md:grid-cols-2 gap-6 animate-fadeIn"
    >
      <!-- 訂單 & 電影資訊 -->
      <div class="space-y-6">
        <!-- 訂單資訊 -->
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

          <!-- 票券明細 -->
          <div class="mt-6 text-base space-y-4">
            <h3 class="font-medium mb-2">票種明細</h3>
            <!-- 票券明細 -->
            <ul
              v-if="ticketLines.length"
              class="list-disc list-inside text-sm ml-3 mt-3"
            >
              <li
                v-for="t in ticketLines"
                :key="t.type"
                class="flex justify-between"
              >
                <span>{{ t.type }} × {{ t.qty }}</span>
                <span>{{ t.sub }} 元</span>
              </li>
            </ul>

            <!-- 餐點明細 -->
            <ul
              v-if="snackLines.length"
              class="list-disc list-inside text-sm ml-3 mt-3"
            >
              <li
                v-for="s in snackLines"
                :key="s.name"
                class="flex justify-between"
              >
                <span>{{ s.name }} × {{ s.qty }}</span>
                <span>{{ s.sub }} 元</span>
              </li>
            </ul>
            <p class="flex justify-between mt-2">
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
          <p>
            <span class="font-medium">電影：</span>{{ movie.chineseName
            }}<span v-if="movie.chineseName"> ({{ movie.englishName }})</span>
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
            <span class="font-medium">座位：</span>{{ movie.seats.join(", ") }}
          </p>
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

    <!-- 返回首頁 -->
    <div v-if="!loading && !error" class="mt-10 text-center">
      <button
        @click="goHome"
        class="inline-flex items-center gap-1 bg-green-600 hover:bg-green-500 transition-colors text-white font-medium py-2 px-6 rounded-2xl shadow"
      >
        <span class="i-lucide-home" /> 返回首頁
      </button>
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
