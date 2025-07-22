<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useBookingStore } from "@/stores/booking";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Pinia & router
const booking = useBookingStore();
const router = useRouter();

// 計算總金額
const grandTotal = computed(() => booking.ticketTotal + booking.snackTotal);

// 票券明細
type TicketEntry = [string, number];
const tickets = computed<TicketEntry[]>(() =>
  (Object.entries(booking.ticketCounts) as TicketEntry[]).filter(
    ([, c]) => c > 0
  )
);

// 金流
async function pay(method: "credit" | "linepay") {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      movieName: booking.movieName,
      sessionId: booking.sessionId,
      sessionTime: booking.sessionTime,
      theaterNo: booking.theaterNo,
      seats: booking.selectedSeats,
      tickets: booking.ticketCounts,
      snacks: booking.snacks,
      amount: grandTotal.value,
      payMethod: method,
    }),
  });
  const { payUrl } = await res.json();
  window.location.href = payUrl;
}
</script>

<template>
  <Breadcrumb></Breadcrumb>
  <main
    class="max-w-screen-lg mx-auto py-10 px-6 grid md:grid-cols-2 gap-8 text-white"
  >
    <!-- 左：明細 -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold mb-4">訂單明細</h2>
      <div class="bg-gray-800/80 rounded-lg p-6 space-y-4">
        <p>電影：{{ booking.movieName }}</p>
        <p>場次：{{ booking.sessionTime }}（{{ booking.theaterNo }}號廳）</p>
        <p>片長：{{ booking.movieDuration }} 分鐘</p>
        <p>座位：{{ booking.selectedSeats.join("、") }}</p>
        <section class="space-y-4">
          <h3 class="mt-4 font-semibold">票券明細</h3>
          <ul>
            <li
              v-for="type in booking.ticketTypes.filter(
                (t) => booking.ticketCounts[t.name] > 0
              )"
              :key="type.name"
              class="flex justify-between"
            >
              <span
                >{{ type.name }} × {{ booking.ticketCounts[type.name] }}</span
              >
              <span class="text-right">
                NT${{ (booking.ticketCounts[type.name] ?? 0) * type.price }}
              </span>
            </li>
          </ul>
        </section>

        <section class="space-y-4">
          <h3 class="mt-4 font-semibold">附餐明細</h3>
          <ul>
            <li
              v-for="s in booking.snacks"
              :key="s.id"
              class="flex justify-between"
            >
              <span>{{ s.name }} × {{ s.qty }}</span>
              <span class="text-right">NT${{ s.price * s.qty }}</span>
            </li>
          </ul>
        </section>

        <hr class="border-gray-300 my-4" />

        <!-- <p class="text-right">票券：NT${{ booking.ticketTotal }}</p>
        <p class="text-right mb-1">餐點：NT${{ booking.snackTotal }}</p> -->
        <p class="text-right font-bold text-xl">總計：NT${{ grandTotal }}</p>
      </div>
    </section>

    <!-- 右：付款 -->
    <aside class="space-y-6">
      <h2 class="text-2xl font-bold mb-4">選擇付款方式</h2>

      <button
        class="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold"
        @click="pay('credit')"
      >
        信用卡付款
      </button>
      <button
        class="w-full py-4 rounded-lg bg-green-600 hover:bg-green-500 font-semibold"
        @click="pay('linepay')"
      >
        LINE&nbsp;Pay
      </button>
      <button
        class="w-full py-3 text-gray-300 underline"
        @click="router.back()"
      >
        ← 返回修改
      </button>
    </aside>
  </main>
</template>

<style scoped>
/* 如有其他樣式再擴充 */
</style>
