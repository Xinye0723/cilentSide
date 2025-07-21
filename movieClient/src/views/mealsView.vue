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

  <main
    class="relative z-10 max-w-screen-lg mx-auto py-10 px-6 grid md:grid-cols-[1fr_300px] gap-8 text-white"
  >
    <!-- 卡片區 -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold">請選擇附餐</h2>

      <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
        <div
          v-for="m in meals"
          :key="m.snackId"
          class="bg-[#121826]/90 p-4 rounded-xl shadow-xl flex flex-col justify-between h-[300px] transition hover:scale-105"
        >
          <div>
            <img
              :src="`https://localhost:7181${m.snackImage}`"
              alt=""
              class="w-full h-32 object-cover rounded mb-3"
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

    <!-- 明細 -->
    <aside
      class="sticky top-10 self-start bg-[#0d1117]/90 p-6 rounded-xl shadow-lg w-full"
    >
      <h2 class="text-xl font-bold mb-4">明細</h2>

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
      <p class="text-right font-bold text-lg mt-2">
        <button>前往結帳</button>
      </p>
    </aside>
  </main>
</template>
