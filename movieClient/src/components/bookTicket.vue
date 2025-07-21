<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Swal from "sweetalert2";

const movieId = Number(useRoute().params.id);

interface SessionDto {
  id: number;
  startDate: string; // 對應後端的 startDate
  startTime: string; // 對應後端的 startTime
  availableSeats: number;
  totalSeats: number;
  theaterNumber: number;
  endDate: string; // 對應後端的 endDate
  endTime: string; // 對應後端的 endTime
}
interface SeatDto {
  id: number;
  row: string;
  col: string;
  isBooked: boolean;
  status?: string;
  isDisabled: boolean; // 新欄位
}
interface TicketType {
  name: string;
  price: number;
}
const TicketTypes = ref<TicketType[]>([
  { name: "全票", price: 360 },
  { name: "會員票", price: 300 },
  { name: "敬老票", price: 200 },
  { name: "愛心票", price: 200 },
  { name: "早場票", price: 260 },
]);
const ticketCounts = ref<Record<string, number>>(
  TicketTypes.value.reduce((acc, type) => ({ ...acc, [type.name]: 0 }), {})
);
const aisleRows = ["D", "H"]; // ← 你想留走道的排，大小寫對應資料
const aisleCols = [4, 30]; // 直向走道（第 2、10 欄右側留縫）★ 新增
const aisleGapPx = 30; // 走道寬 (px)；改大改小都行
const sessions = ref<SessionDto[]>([]);
const loadingSess = ref(true);
const error = ref("");

const selectedDate = ref<string | null>(null);
const selectedSession = ref<SessionDto | null>(null);

const seats = ref<SeatDto[]>([]);
const loadingSeats = ref(false);
const selectedSeats = ref<SeatDto[]>([]);
// 計算總票數
const totalTickets = computed(() =>
  Object.values(ticketCounts.value).reduce((sum, count) => sum + count, 0)
);
// 驗證票數是否有效
const isTicketCountValid = computed(() => {
  if (!selectedSession.value) return true;
  return totalTickets.value <= selectedSession.value.availableSeats;
});
onMounted(async () => {
  try {
    const res = await fetch(`/api/ShowTimes/movie/${movieId}`);
    if (!res.ok) throw new Error(res.statusText);
    sessions.value = await res.json();

    // 嘗試還原資料
    const cached = localStorage.getItem("bookingState");
    if (cached) {
      const parsed = JSON.parse(cached);
      const matched = sessions.value.find((s) => s.id === parsed.sessionId);
      if (matched) {
        selectedDate.value = matched.startDate;
        selectedSession.value = matched;
        ticketCounts.value = parsed.ticketCounts;
        selectedSeats.value = parsed.selectedSeats;

        const resSeats = await fetch(`/api/ShowTimes/${matched.id}/seats`);
        if (resSeats.ok) {
          seats.value = await resSeats.json();
        }
      }
    }
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loadingSess.value = false;
  }
});

const dates = computed(() =>
  Array.from(new Set(sessions.value.map((s) => s.startDate))).sort()
);
const sessionsOfSelected = computed(() =>
  sessions.value.filter((s) => s.startDate === selectedDate.value)
);

async function chooseSession(sess: SessionDto) {
  selectedSession.value = sess;
  selectedSeats.value = []; // 重置座位
  ticketCounts.value = TicketTypes.value.reduce(
    (acc, type) => ({ ...acc, [type.name]: 0 }),
    {}
  ); // 重置票數
  loadingSeats.value = true;
  try {
    const res = await fetch(`/api/ShowTimes/${sess.id}/seats`);
    if (!res.ok) throw new Error(res.statusText);
    seats.value = await res.json();
  } catch (e: any) {
    await Swal.fire({
      icon: "error",
      title: "座位資料取得失敗",
      text: e.message,
      confirmButtonColor: "#d33",
    });
    seats.value = [];
  } finally {
    loadingSeats.value = false;
  }
}

function toggleSeat(seat: SeatDto) {
  if (seat.isBooked) return;
  if (totalTickets.value === 0) {
    Swal.fire({
      icon: "warning",
      title: "請先選擇票數！",
      confirmButtonColor: "#d33",
    });
    return;
  }

  const idx = selectedSeats.value.findIndex((s) => s.id === seat.id);
  if (idx === -1) {
    if (selectedSeats.value.length < totalTickets.value) {
      selectedSeats.value.push(seat);
    } else {
      Swal.fire({
        icon: "info",
        title: "已達選擇的票數上限！",
        text: "請取消其他座位或調整票數。",
        confirmButtonColor: "#3085d6",
      });
    }
  } else {
    selectedSeats.value.splice(idx, 1);
  }
}
function incrementTicket(type: string) {
  if (totalTickets.value < selectedSession.value!.availableSeats) {
    ticketCounts.value[type] += 1;
    // 如果票數增加導致超過已選座位數，重置座位
    if (selectedSeats.value.length > totalTickets.value) {
      selectedSeats.value = selectedSeats.value.slice(0, totalTickets.value);
    }
  } else {
    Swal.fire({
      icon: "warning",
      title: "票數超出限制",
      text: "不能超過可用座位數",
      confirmButtonColor: "#f39c12",
    });
  }
}
function decrementTicket(type: string) {
  if (ticketCounts.value[type] > 0) {
    ticketCounts.value[type] -= 1;
    // 如果票數減少導致超過已選座位數，重置座位
    if (selectedSeats.value.length > totalTickets.value) {
      selectedSeats.value = selectedSeats.value.slice(0, totalTickets.value);
    }
  }
}
function fmtTime(str: string) {
  return new Date(`1970-01-01T${str}`).toLocaleTimeString("zh-TW", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

const maxCol = 34;
const colNums = Array.from({ length: maxCol }, (_, i) => i + 1);
const seatMapsByRow = computed(() => {
  const tmp = new Map<string, Map<number, SeatDto>>();
  for (const seat of seats.value) {
    if (!tmp.has(seat.row)) tmp.set(seat.row, new Map());
    tmp.get(seat.row)!.set(Number(seat.col), seat);
  }
  return Array.from(tmp.entries()).sort((a, b) => a[0].localeCompare(b[0]));
});
const gridTemplate = computed(() => {
  const parts: string[] = [];
  for (let c = 1; c <= maxCol; c++) {
    parts.push("2rem"); // 每個座位格 2rem
    if (aisleCols.includes(c)) parts.push(`${aisleGapPx}px`); // 直向走道
  }
  return parts.join(" ");
});
// 座位點選顯示邏輯
const sortedSelectedSeats = computed(() =>
  selectedSeats.value.slice().sort((a, b) => {
    if (a.row === b.row) {
      return Number(a.col) - Number(b.col);
    }
    return a.row.localeCompare(b.row);
  })
);
function saveBookingState() {
  localStorage.setItem(
    "bookingState",
    JSON.stringify({
      selectedSeats: selectedSeats.value,
      ticketCounts: ticketCounts.value,
      sessionId: selectedSession.value?.id,
    })
  );
}
</script>

<template>
  <main class="max-w-screen-lg px-20 py-10 text-white space-y-10 mx-19">
    <!-- ← 靠左並預留 1rem 內距 -->
    <!-- 日期 -->
    <section>
      <h2 class="text-2xl font-bold mb-4">請選擇日期</h2>
      <p v-if="loadingSess" class="text-gray-400">載入中…</p>
      <p v-else-if="error" class="text-red-400">{{ error }}</p>

      <div v-else class="flex flex-wrap justify-start gap-3">
        <button
          v-for="d in dates"
          :key="d"
          @click="
            selectedDate = d;
            selectedSession = null;
          "
          :class="[
            'px-4 py-2 rounded border font-semibold transition',
            d === selectedDate
              ? 'bg-red-500 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600',
          ]"
        >
          {{ d }}
        </button>
      </div>
    </section>

    <!-- 場次 -->
    <section v-if="selectedDate">
      <h2 class="text-2xl font-bold mb-4">請選擇場次</h2>
      <div class="flex flex-wrap justify-start gap-3">
        <button
          v-for="s in sessionsOfSelected"
          :key="s.id"
          @click="chooseSession(s)"
          :disabled="s.availableSeats === 0"
          :class="[
            'px-4 py-2 rounded border font-semibold transition flex flex-col items-center justify-center',
            selectedSession?.id === s.id
              ? 'bg-red-500 text-white'
              : s.availableSeats
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-700 text-gray-200 opacity-40 cursor-not-allowed',
          ]"
        >
          <span>{{ fmtTime(s.startTime) }}~{{ fmtTime(s.endTime) }}</span>
          <span class="text-sm">({{ s.theaterNumber }}號廳)</span>
        </button>
      </div>
    </section>
    <!-- 票種與張數 -->
    <section v-if="selectedSession">
      <h2 class="text-2xl font-bold mb-4">請選擇票種&張數</h2>
      <div class="space-y-4">
        <div
          v-for="type in TicketTypes"
          :key="type.name"
          class="flex items-center justify-between bg-gray-800 p-4 rounded"
        >
          <span class="text-lg font-semibold"
            >{{ type.name }} (NT${{ type.price }})</span
          >
          <div class="flex items-center gap-2">
            <button
              @click="decrementTicket(type.name)"
              :disabled="ticketCounts[type.name] === 0"
              class="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-40"
            >
              -
            </button>
            <span class="w-12 text-center">{{ ticketCounts[type.name] }}</span>
            <button
              @click="incrementTicket(type.name)"
              :disabled="totalTickets >= selectedSession.availableSeats"
              class="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
        <p v-if="!isTicketCountValid" class="text-red-400">
          票數總和不可超過場次可用座位數 ({{
            selectedSession.availableSeats
          }})！
        </p>
      </div>
    </section>
    <!-- 🎫 座位圖 -->
    <!-- 已選座位 & 圖例 -->
    <section v-if="selectedSession" class="space-y-6 px-8">
      <p class="mt-4">
        已選座位：
        <span v-if="sortedSelectedSeats.length">
          {{ sortedSelectedSeats.map((s) => s.row + s.col).join("、") }}
        </span>
        <span v-else class="text-gray-400">無</span>
      </p>

      <RouterLink
        v-if="selectedSeats.length === totalTickets"
        :to="{
          name: 'meals',
          state: {
            selectedSeats,
            ticketCounts,
            sessionId: selectedSession?.id,
          },
        }"
        @click="saveBookingState()"
        class="rounded bg-red-600 hover:bg-red-700 text-white p-2 px-3 inline-block"
      >
        下一步
      </RouterLink>

      <!-- ① 包一層 inline-block，讓內容寬度可被 w-full 捕捉 -->
      <div class="inline-block ml-20">
        <!-- 螢幕文字＋條，直接用 w-full 置中 -->
        <p class="text-center text-gray-400 mb-1">螢幕位置</p>
        <div
          class="h-1 w-full bg-gradient-to-r from-white/10 via-white to-white/10 rounded-full mb-3"
        ></div>

        <!-- ② 逐排渲染：2 欄 Grid（排號 + 座位Grid） -->
        <div
          v-for="[row, seatMap] in seatMapsByRow"
          :key="row"
          class="grid grid-cols-[1.5rem_auto] items-center gap-x-2 gap-y-1"
          :class="aisleRows.includes(row) && 'mt-4'"
        >
          <!-- 左欄：排號 -->
          <span
            class="w-6 h-8 flex items-center justify-center text-sm text-gray-300"
          >
            {{ row }}
          </span>

          <!-- 單排座位 Grid：保留 gap-x-4 + 動態欄寬 -->
          <div
            class="grid gap-x-4 m-1"
            :style="{ gridTemplateColumns: gridTemplate }"
          >
            <template v-for="col in colNums" :key="'seat' + col">
              <!-- 🚫 停用 -->
              <div
                v-if="seatMap.has(col) && seatMap.get(col)!.isDisabled"
                class="w-8 h-8"
              ></div>

              <!-- ✅ 有座位 -->
              <button
                v-else-if="seatMap.has(col)"
                :key="seatMap.get(col)!.id"
                @click="toggleSeat(seatMap.get(col)!)"
                :disabled="seatMap.get(col)!.isBooked"
                :class="[
        'w-8 h-8 rounded text-xs font-semibold flex items-center justify-center transition seat',
        seatMap.get(col)!.isBooked
          ? 'bg-gray-500 cursor-not-allowed text-white/70'
          : selectedSeats.some(s => s.id === seatMap.get(col)!.id)
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      ]"
              >
                {{ col }}
              </button>

              <!-- ⬜ 本來不存在 -->
              <div v-else class="w-8 h-8"></div>

              <!-- ✨ 直向走道：在該欄後補一格透明占位 -->
              <div
                v-if="aisleCols.includes(col)"
                :key="'aisle' + col"
                :style="{ width: aisleGapPx + 'px', height: '1px' }"
              ></div>
            </template>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-6 mt-6 text-sm">
        <div class="flex items-center gap-2">
          <span class="inline-block w-4 h-4 rounded bg-green-500" /><span
            >可選</span
          >
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-4 h-4 rounded bg-red-600" /><span
            >已選</span
          >
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-4 h-4 rounded bg-gray-500" /><span
            >已售</span
          >
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.seat {
  transition: transform 0.15s ease;
}
.seat:hover {
  transform: scale(1.08);
}
</style>
