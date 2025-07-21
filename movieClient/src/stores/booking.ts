import { defineStore } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";

interface TicketType {
  name: string;
  price: number;
}

export const useBookingStore = defineStore("booking", {
  /* ---------- state ---------- */
  state: () => ({
    ticketCounts: {} as Record<string, number>,
    ticketTypes: [] as TicketType[],
    sessionId: 0,
    selectedSeats: [] as string[],
  }),

  /* ---------- actions ---------- */
  actions: {
    setTicketData(
      counts: Record<string, number>,
      types: TicketType[],
      sessionId: number
    ) {
      this.ticketCounts = counts;
      this.ticketTypes = types;
      this.sessionId = sessionId;
    },
    setSeats(seats: string[]) {
      this.selectedSeats = seats;
    },
    /** 呼叫一次即可清空整筆訂單（離開流程時） */
    reset() {
      this.$reset();
    },
  },

  /* ---------- persistence ---------- */
  persist: {
    storage: sessionStorage,
    pick: ["ticketCounts", "ticketTypes", "sessionId", "selectedSeats"],
  } satisfies PersistenceOptions,
});
