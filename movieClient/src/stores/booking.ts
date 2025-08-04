import { defineStore } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";

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

export const useBookingStore = defineStore("booking", {
  state: () => ({
    /* 票券階段 */
    ticketCounts: {} as Record<string, number>,
    ticketTypes: [] as TicketType[],
    movieName: "",
    sessionId: 0,
    sessionTime: "",
    theaterNo: 0,
    selectedSeats: [] as string[],
    ticketTotal: 0,
    movieDuration: 0,
    /* 附餐階段 */
    snacks: [] as SnackItem[],
    snackTotal: 0,
    /* 新增：結帳資訊 */
    orderNumber: "", // ← 送綠界前寫入
    orderAmount: 0, // ← 送綠界前寫入
  }),

  actions: {
    setTicketData(payload: Record<string, any>) {
      Object.assign(this, payload);
    },
    setSnackData(snacks: SnackItem[], total: number) {
      this.snacks = snacks;
      this.snackTotal = total;
    },
    setOrderInfo(no: string, amt: number) {
      // ← 新增
      this.orderNumber = no;
      this.orderAmount = amt;
    },
    reset() {
      this.$reset();
    },
  },

  persist: <PersistenceOptions>{
    storage: localStorage, // ← 改這裡
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
      "orderNumber",
      "orderAmount", // ← 新增
    ],
  },
});
