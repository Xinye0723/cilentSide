<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia"; // ← 新增
import PopcornBackground from "@/components/PopcornBackground.vue";
import { useBookingStore } from "@/stores/booking";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

/* ---------- 票券 (來自 Pinia) ---------- */
const booking = useBookingStore();
const { ticketCounts, ticketTypes } = storeToRefs(booking);

/* ---------- 附餐 ---------- */
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
  quantity: number;
}
const meals = ref<Meal[]>([]);
const selectedMeals = ref<SelectedMeal[]>([]);

/* 票券小計 / 附餐小計 / 總額 */
/* 票券小計 / 附餐小計 / 總額 */
const ticketTotal = computed(() =>
  ticketDetails.value.reduce((sum, t) => sum + t.subtotal, 0)
);
const snackTotal = computed(() =>
  selectedMeals.value.reduce((s, m) => s + m.price * m.quantity, 0)
);
const grandTotal = computed(() => ticketTotal.value + snackTotal.value);

/* ---------- 取得 snack 資料 ---------- */
onMounted(async () => {
  try {
    const res = await fetch("https://localhost:7181/api/snacks");
    meals.value = await res.json();
  } catch (e) {
    console.error(e);
  }
});

/* ---------- 加減餐點 ---------- */
function addMeal(meal: Meal) {
  const i = selectedMeals.value.findIndex((m) => m.id === meal.snackId);
  i >= 0
    ? selectedMeals.value[i].quantity++
    : selectedMeals.value.push({
        id: meal.snackId,
        name: meal.snackName,
        price: meal.snackPrice,
        quantity: 1,
      });
}

function removeMeal(meal: Meal) {
  const i = selectedMeals.value.findIndex((m) => m.id === meal.snackId);
  if (i >= 0 && --selectedMeals.value[i].quantity <= 0)
    selectedMeals.value.splice(i, 1);
}
const deleteMeal = (id: number) =>
  (selectedMeals.value = selectedMeals.value.filter((m) => m.id !== id));
const ticketDetails = computed(() =>
  ticketTypes.value
    .filter((t) => (ticketCounts.value[t.name] ?? 0) > 0)
    .map((t) => ({
      ...t,
      count: ticketCounts.value[t.name],
      subtotal: t.price * (ticketCounts.value[t.name] ?? 0),
    }))
);
</script>

<template>
  <PopcornBackground />

  <!-- ❶ 仍用 max-w-screen-lg，但改成 3 欄 Grid  -->
  <main
    class="relative z-10 max-w-screen-xl mx-auto py-10 px-6 text-white grid gap-10 md:grid-cols-[1fr_320px]"
  >
    <section>
      <h2 class="text-2xl font-bold mb-6">請選擇附餐</h2>

      <!-- 依容器寬度自動塞滿 -->
      <div class="grid gap-8 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        <div
          v-for="m in meals"
          :key="m.snackId"
          class="bg-[#121826]/90 p-4 rounded-xl shadow-xl flex flex-col justify-between h-[300px] transition hover:scale-105"
        >
          <div>
            <img
              :src="`https://localhost:7181${m.snackImage}`"
              alt=""
              class="w-full h-40 object-cover rounded mb-3"
            />
            <h3 class="text-base font-semibold mb-1">{{ m.snackName }}</h3>
            <p class="font-bold text-yellow-400">NT${{ m.snackPrice }}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button class="w-8 h-8 bg-red-600 rounded" @click="removeMeal(m)">
              -
            </button>
            <button class="w-8 h-8 bg-green-600 rounded" @click="addMeal(m)">
              +
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ❸ 明細側欄：放第 3 欄，sticky 吸頂 -->
    <aside
      class="sticky top-10 self-start bg-[#0d1117]/90 p-6 rounded-xl shadow-lg"
    >
      <h2 class="text-xl font-bold mb-4">明細</h2>

      <!-- 票券 -->
      <template v-if="ticketTotal">
        <h3 class="mb-2 font-semibold">票券</h3>
        <ul class="text-lg mb-4 space-y-1">
          <li v-for="d in ticketDetails" :key="d.name">
            {{ d.name }} × {{ d.count }}
            <span class="float-right">NT${{ d.subtotal }}</span>
          </li>
        </ul>
        <hr class="border-gray-300 mb-4" />
      </template>

      <!-- 附餐 -->
      <h3 class="font-semibold mb-2">附餐</h3>
      <ul class="text-lg space-y-1">
        <li
          v-for="s in selectedMeals"
          :key="s.id"
          class="grid grid-cols-[auto_5rem_1.5rem] items-center gap-2"
        >
          <span>{{ s.name }} × {{ s.quantity }}</span>
          <span class="text-right">NT${{ s.price * s.quantity }}</span>
          <button class="text-red-400" @click="deleteMeal(s.id)">✕</button>
        </li>
      </ul>

      <hr class="my-4 border-gray-300" />

      <p class="text-right text-lg">票券：NT${{ ticketTotal }}</p>
      <p class="text-right mb-1 text-lg">附餐：NT${{ snackTotal }}</p>
      <p class="text-right font-bold text-lg">總金額：NT${{ grandTotal }}</p>

      <!-- 結帳按鈕 -->
      <div class="mt-4 text-center">
        <button
          class="w-full py-3 rounded-lg font-semibold tracking-wide bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:brightness-110 transition"
        >
          前往結帳
        </button>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.button {
  width: 100%;
  padding: 0.6rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  gap: 0.4rem;
  font-weight: bold;
  border-radius: 30px;
  text-shadow: 2px 2px 3px rgb(136 0 136 / 50%);
  background: linear-gradient(
      15deg,
      #880088,
      #aa2068,
      #cc3f47,
      #de6f3d,
      #f09f33,
      #de6f3d,
      #cc3f47,
      #aa2068,
      #880088
    )
    no-repeat;
  background-size: 300%;
  color: #ffffff;
  border: none;
  background-position: left center;
  box-shadow: 0 30px 10px -20px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
}
.button:hover {
  background-size: 320%;
  background-position: right center;
}
</style>
