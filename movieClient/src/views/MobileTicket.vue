<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

/* ---------- 取得 orderId ---------- */
const route = useRoute();
const router = useRouter();
const orderId = route.query.orderId as string;

/* ---------- 畫面狀態 ---------- */
const loading = ref(true);
const error = ref("");

/* ---------- 資料結構 ---------- */
interface Order {
  orderNumber: string;
  paymentTime: string;
  amount: number;
}
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
interface MovieInfo {
  chineseName: string;
  englishName: string;
  sessionDate: string;
  sessionTime: string;
  theaterNumber: number;
  seats: string[];
}

const order = ref<Order>({ orderNumber: orderId, paymentTime: "", amount: 0 });
const movie = ref<MovieInfo>({
  chineseName: "",
  englishName: "",
  sessionDate: "",
  sessionTime: "",
  theaterNumber: 0,
  seats: [],
});
const ticketLines = ref<TicketLine[]>([]);
const snackLines = ref<SnackLine[]>([]);

/* ---------- 掛載時撈單 ---------- */
onMounted(async () => {
  try {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) throw new Error("查無訂單");
    const data = await res.json();

    order.value = {
      orderNumber: data.orderNo,
      paymentTime: new Date(data.createTime).toLocaleString(),
      amount: data.totalPrice,
    };

    movie.value = {
      chineseName: data.movieChineseName ?? "未知",
      englishName: data.movieEnglishName,
      sessionDate: data.sessionDate ?? "",
      sessionTime: data.sessionTime?.substring(11, 16) ?? "",
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
    error.value = e.message || "載入失敗";
  } finally {
    loading.value = false;
  }
});

/* ---------- 返回首頁 ---------- */
function goHome() {
  router.push("/");
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-6 px-4"
  >
    <h1 class="text-2xl font-bold mb-6 text-center">訂單資訊</h1>

    <!-- 狀態 -->
    <p v-if="loading" class="text-gray-400 mt-10">載入中…</p>
    <p v-else-if="error" class="text-red-400 mt-10">{{ error }}</p>

    <!-- 內容 -->
    <div v-else class="w-full max-w-xl space-y-6">
      <!-- 訂單 -->
      <section class="bg-gray-800 rounded-2xl shadow p-5 space-y-2">
        <h2 class="text-lg font-semibold text-center mb-2">訂單</h2>
        <p><span class="font-medium">編號：</span>{{ order.orderNumber }}</p>
        <p><span class="font-medium">時間：</span>{{ order.paymentTime }}</p>
        <p><span class="font-medium">金額：</span>{{ order.amount }} 元</p>
      </section>

      <!-- 電影 -->
      <section class="bg-gray-800 rounded-2xl shadow p-5 space-y-2">
        <h2 class="text-lg font-semibold text-center mb-2">電影</h2>
        <p>
          <span class="font-medium">片名：</span>{{ movie.chineseName }}
          <span v-if="movie.englishName"> ({{ movie.englishName }})</span>
        </p>
        <p>
          <span class="font-medium">場次：</span>{{ movie.sessionDate }}
          {{ movie.sessionTime }}
        </p>
        <p>
          <span class="font-medium">影廳：</span>{{ movie.theaterNumber }} 號廳
        </p>
        <p>
          <span class="font-medium">座位：</span>{{ movie.seats.join(", ") }}
        </p>
      </section>

      <!-- 明細 -->
      <section class="bg-gray-800 rounded-2xl shadow p-5 space-y-4">
        <h2 class="text-lg font-semibold text-center mb-2">明細</h2>

        <ul v-if="ticketLines.length" class="space-y-1 text-sm">
          <li
            v-for="t in ticketLines"
            :key="t.type"
            class="flex justify-between"
          >
            <span>{{ t.type }} × {{ t.qty }}</span
            ><span>{{ t.sub }} 元</span>
          </li>
        </ul>

        <ul v-if="snackLines.length" class="space-y-1 text-sm">
          <li
            v-for="s in snackLines"
            :key="s.name"
            class="flex justify-between"
          >
            <span>{{ s.name }} × {{ s.qty }}</span
            ><span>{{ s.sub }} 元</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- 返回 -->
    <button
      v-if="!loading && !error"
      @click="goHome"
      class="mt-8 bg-green-600 hover:bg-green-500 transition-colors text-white font-medium py-2 px-10 rounded-2xl shadow"
    >
      返回首頁
    </button>
  </div>
</template>

<style scoped>
/* 手機視覺簡潔就好，不再額外動畫 */
</style>
