<script setup lang="ts">
/* ------------ 基本 import ------------ */
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import PopcornBackground from "@/components/PopcornBackground.vue";
import { useBookingStore } from "@/stores/booking";

/* ------------ Pinia -------------- */
const booking = useBookingStore();
// 從 store 拿出已儲存的 snacks & snackTotal
const { snacks, snackTotal: persistedSnackTotal } = storeToRefs(booking);

/* ------------ 本地 selectedMeals ------------ */
interface Meal {
  snackId: number;
  snackName: string;
  snackPrice: number;
  snackImage: string;
}
interface SelectedMeal {
  id: number;
  name: string;
  price: number;
  qty: number;
}
const meals = ref<Meal[]>([]);
const selectedMeals = ref<SelectedMeal[]>([]);

/* ------------ 畫面載入時，先從 store 把之前選的餐點還原過來 ------------ */
onMounted(async () => {
  try {
    const res = await fetch("/api/snacks");
    meals.value = await res.json();
  } catch (err) {
    console.error(err);
  }

  // 把之前 persist 下來的 snacks 拷貝到本地
  selectedMeals.value = snacks.value.map((s) => ({ ...s }));
});

/* ------------ 每次本地 selectedMeals 變動，就同步回 store ------------ */
watch(
  selectedMeals,
  () => {
    booking.setSnackData(
      selectedMeals.value.map((s) => ({ ...s })), // 深拷貝
      snackTotal.value
    );
  },
  { deep: true }
);

/* ------------ 加減餐點 ------------ */
function add(m: Meal) {
  const idx = selectedMeals.value.findIndex((s) => s.id === m.snackId);
  if (idx > -1) {
    selectedMeals.value[idx].qty++;
  } else {
    selectedMeals.value.push({
      id: m.snackId,
      name: m.snackName,
      price: m.snackPrice,
      qty: 1,
    });
  }
}

function sub(m: Meal) {
  const idx = selectedMeals.value.findIndex((s) => s.id === m.snackId);
  if (idx > -1 && --selectedMeals.value[idx].qty <= 0) {
    selectedMeals.value.splice(idx, 1);
  }
}

/* ------------ 計算小計 ------------ */
interface TicketDetail {
  name: string;
  price: number;
  count: number;
  subtotal: number;
}

const { ticketCounts, ticketTypes } = storeToRefs(booking);

const ticketDetails = computed<TicketDetail[]>(() =>
  ticketTypes.value
    .filter((type) => (ticketCounts.value[type.name] ?? 0) > 0)
    .map((type) => ({
      ...type,
      count: ticketCounts.value[type.name],
      subtotal: type.price * (ticketCounts.value[type.name] ?? 0),
    }))
);

const ticketTotal = computed(() =>
  ticketDetails.value.reduce((sum, t) => sum + t.subtotal, 0)
);

const snackTotal = computed(() =>
  selectedMeals.value.reduce((sum, s) => sum + s.price * s.qty, 0)
);

const grandTotal = computed(() => ticketTotal.value + snackTotal.value);

/* ------------ 結帳 ----------------- */
const router = useRouter();
function goCheckout() {
  // 此時 watch 已經幫你把 selectedMeals 同步到 store 了，
  // 這邊只要跳頁到 orderDetail 即可
  router.push({ name: "orderDetail" });
}
</script>

<template>
  <PopcornBackground />

  <main
    class="relative z-10 max-w-screen-xl mx-auto py-10 px-6 grid gap-10 md:grid-cols-[1fr_320px] text-white"
  >
    <!-- 左：附餐清單 -->
    <section>
      <h2 class="text-2xl font-bold mb-6">請選擇附餐</h2>

      <div class="grid gap-8 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        <div
          v-for="m in meals"
          :key="m.snackId"
          class="bg-[#121826]/90 rounded-xl shadow-xl p-4 flex flex-col justify-between h-[300px] transition hover:scale-105"
        >
          <div>
            <!-- 圖檔路徑可依實際情況調整 -->
            <img
              :src="`https://localhost:7181${m.snackImage}`"
              class="w-full h-40 object-cover rounded mb-3"
            />
            <h3 class="text-base font-semibold mb-1">{{ m.snackName }}</h3>
            <p class="font-bold text-yellow-400">NT${{ m.snackPrice }}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button class="w-8 h-8 bg-red-600 rounded" @click="sub(m)">
              -
            </button>
            <button class="w-8 h-8 bg-green-600 rounded" @click="add(m)">
              +
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 右：明細側欄 -->
    <aside
      class="sticky top-10 self-start bg-[#0d1117]/90 p-6 rounded-xl shadow-lg"
    >
      <h2 class="text-xl font-bold mb-4">明細</h2>

      <!-- 票券 -->
      <template v-if="ticketTotal">
        <h3 class="mb-2 font-semibold">票券</h3>
        <ul class="space-y-1">
          <li v-for="d in ticketDetails" :key="d.name">
            {{ d.name }} × {{ d.count }}
            <span class="float-right">NT${{ d.subtotal }}</span>
          </li>
        </ul>
        <hr class="border-gray-300 my-4" />
      </template>

      <!-- 附餐 -->
      <h3 class="font-semibold mb-2">附餐</h3>
      <ul class="space-y-1">
        <li
          v-for="s in selectedMeals"
          :key="s.id"
          class="grid grid-cols-[auto_5rem_1.5rem] items-center gap-2"
        >
          <span>{{ s.name }} × {{ s.qty }}</span>
          <span class="text-right">NT${{ s.price * s.qty }}</span>
          <button
            class="text-red-400"
            @click="selectedMeals.splice(selectedMeals.indexOf(s), 1)"
          >
            ✕
          </button>
        </li>
      </ul>

      <hr class="border-gray-300 my-4" />

      <p class="text-right">票券：NT${{ ticketTotal }}</p>
      <p class="text-right mb-1">附餐：NT${{ snackTotal }}</p>
      <p class="text-right font-bold text-lg">總金額：NT${{ grandTotal }}</p>

      <button
        class="w-full py-3 mt-4 rounded-lg font-semibold tracking-wide bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:brightness-110 transition"
        @click="goCheckout"
      >
        前往結帳
      </button>
    </aside>
  </main>
</template>

<style scoped></style>
