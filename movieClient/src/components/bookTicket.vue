<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

/* ────── 1. 取得電影 id ────── */
const movieId = Number(useRoute().params.id);
console.log("movieId =", movieId);
/* ────── 2. 型別 & state ────── */
interface SessionDto {
  id: number; // ShowTimeId
  date: string; // "2025-07-15"
  time: string; // "14:30"
  availableSeats: number;
  totalSeats: number;
}
interface SeatDto {
  id: number;
  row: string;
  col: number;
  isBooked: boolean;
}

const sessions = ref<SessionDto[]>([]);
const loadingSess = ref(true);
const error = ref("");

const selectedDate = ref<string | null>(null);
const selectedSession = ref<SessionDto | null>(null);

/* 座位 */
const seats = ref<SeatDto[]>([]);
const loadingSeats = ref(false);
const selectedSeats = ref<SeatDto[]>([]); // 你要下訂的座位

/* ────── 3. 取得所有場次 ────── */
onMounted(async () => {
  try {
    const res = await fetch(`/api/ShowTimes/movie/${movieId}`);
    if (!res.ok) throw new Error(res.statusText);
    sessions.value = await res.json();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loadingSess.value = false;
  }
});

/* ────── 4. 計算日期清單 & 篩場次 ────── */
const dates = computed(() =>
  Array.from(new Set(sessions.value.map((s) => s.date))).sort()
);
const sessionsOfSelected = computed(() =>
  sessions.value.filter((s) => s.date === selectedDate.value)
);

/* ────── 5. 選場次 → 抓座位 ────── */
async function chooseSession(sess: SessionDto) {
  selectedSession.value = sess;
  selectedSeats.value = [];
  loadingSeats.value = true;
  try {
    const res = await fetch(`/api/ShowTimes/${sess.id}/seats`);
    if (!res.ok) throw new Error(res.statusText);
    seats.value = await res.json();
  } catch (e: any) {
    alert("座位資料取得失敗：" + e.message);
    seats.value = [];
  } finally {
    loadingSeats.value = false;
  }
}

/* ────── 6. 點選／取消座位 ────── */
function toggleSeat(seat: SeatDto) {
  if (seat.isBooked) return; // 已售出不可選
  const idx = selectedSeats.value.findIndex((s) => s.id === seat.id);
  if (idx === -1) selectedSeats.value.push(seat);
  else selectedSeats.value.splice(idx, 1); // 取消
}
function fmtTime(str: string) {
  // 把 "02:00:00" 裝進一個 Date，再格式化
  return new Date(`1970-01-01T${str}`).toLocaleTimeString("zh-TW", {
    hour12: false, // 24 小時制
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <main class="max-w-screen-lg mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold">選擇日期與場次</h1>

    <!-- 讀取場次 -->
    <div v-if="loadingSess" class="text-center text-gray-400 py-10">
      載入中…
    </div>
    <div v-else-if="error" class="text-center text-red-400 py-10">
      {{ error }}
    </div>

    <!-- 日期按鈕 -->
    <div v-else class="flex flex-wrap gap-2">
      <button
        v-for="d in dates"
        :key="d"
        @click="
          selectedDate = d;
          selectedSession = null;
        "
        :class="[
          'px-4 py-2 rounded border',
          d === selectedDate
            ? 'bg-red-500 text-white'
            : 'bg-gray-700 text-gray-100',
        ]"
      >
        {{ d }}
      </button>
    </div>

    <!-- 場次列表 -->
    <div v-if="selectedDate" class="grid sm:grid-cols-2 gap-4">
      <button
        v-for="s in sessionsOfSelected"
        :key="s.id"
        @click="chooseSession(s)"
        :disabled="s.availableSeats === 0"
        :class="[
          'border rounded p-4 flex justify-between',
          selectedSession?.id === s.id ? 'ring-2 ring-red-500' : '',
          s.availableSeats ? 'hover:bg-gray-800' : 'opacity-40',
        ]"
      >
        <span class="font-semibold text-lg">{{ fmtTime(s.time) }}</span>
        <!-- <span class="text-sm text-gray-400">
          剩 {{ s.availableSeats }}/{{ s.totalSeats }}
        </span> -->
      </button>
    </div>

    <!-- 座位圖 -->
    <section v-if="selectedSession">
      <h2 class="text-2xl font-bold mb-3">
        選擇座位 - {{ selectedSession.date }} {{ selectedSession.time }}
      </h2>

      <!-- 讀取座位 -->
      <div v-if="loadingSeats" class="text-gray-400 py-10">座位載入中…</div>

      <div v-else class="space-y-2">
        <!-- 用 CSS Grid 畫座位 -->
        <div
          v-for="row in Array.from(new Set(seats.map((s) => s.row)))"
          :key="row"
          class="flex items-center gap-2"
        >
          <span class="w-6 text-right">{{ row }}</span>

          <div class="grid grid-cols-12 gap-1">
            <button
              v-for="seat in seats.filter((s) => s.row === row)"
              :key="seat.id"
              @click="toggleSeat(seat)"
              :class="[
                'w-8 h-8 rounded text-xs',
                seat.isBooked
                  ? 'bg-gray-500 cursor-not-allowed'
                  : selectedSeats.some((s) => s.id === seat.id)
                  ? 'bg-red-500'
                  : 'bg-green-500 hover:bg-green-600',
              ]"
            >
              {{ seat.col }}
            </button>
          </div>
        </div>

        <!-- 已選摘要 -->
        <p class="mt-4">
          已選座位：
          <span v-if="selectedSeats.length">
            {{ selectedSeats.map((s) => s.row + s.col).join("、") }}
          </span>
          <span v-else class="text-gray-400">無</span>
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* 可再加圖例/螢幕文字 */
</style>
