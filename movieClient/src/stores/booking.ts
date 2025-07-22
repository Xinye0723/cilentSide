import { defineStore } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";

/* ----------  自訂型別  ---------- */
export interface TicketType {
  name: string;
  price: number;
}
export interface SnackItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface BookingState {
  /* 票券階段 */
  ticketCounts: Record<string, number>;
  ticketTypes: TicketType[];
  movieName: string;
  sessionId: number;
  sessionTime: string;
  theaterNo: number;
  selectedSeats: string[];
  ticketTotal: number;
  movieDuration: number;
  /* 附餐階段 */
  snacks: SnackItem[];
  snackTotal: number;
}

/* ----------  Store  ---------- */
export const useBookingStore = defineStore("booking", {
  /* -------- state -------- */
  state: (): BookingState => ({
    ticketCounts: {},
    ticketTypes: [],
    movieName: "",
    sessionId: 0,
    sessionTime: "",
    theaterNo: 0,
    selectedSeats: [],
    ticketTotal: 0,
    snacks: [],
    snackTotal: 0,
    movieDuration: 0,
  }),

  /* -------- actions ------ */
  actions: {
    /** ① 票券 → 座位 → 附餐 */
    setTicketData(payload: {
      movieName: string;
      sessionId: number;
      sessionTime: string;
      theaterNo: number;
      ticketCounts: Record<string, number>;
      ticketTypes: TicketType[];
      selectedSeats: string[];
      ticketTotal: number;
      movieDuration: number;
    }) {
      Object.assign(this, payload);
    },

    /** ② 附餐 → 結帳 */
    setSnackData(snacks: SnackItem[], snackTotal: number) {
      this.snacks = snacks;
      this.snackTotal = snackTotal;
    },

    /** ③ 流程結束或取消時清空 */
    reset() {
      this.$reset();
    },
  },

  /* -------- persist ------ */
  /** ❷ 這裡的型別用 `PersistedStateOptions`，欄位叫 `paths` */
  persist: <PersistenceOptions>{
    storage: sessionStorage,
    paths: [
      "ticketCounts",
      "ticketTypes",
      "movieName",
      "sessionId",
      "sessionTime",
      "theaterNo",
      "selectedSeats",
      "ticketTotal",
      "movieDuration",
      "snacks",
      "snackTotal",
    ],
  },
});
