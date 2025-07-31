/**
 * Pinia Store：集中 SignalR 連線、房間 / 訊息 / 成員 取得與狀態管理
 * ------------------------------------------------------------------
 * ★ 本版把 API_BASE、HUB_BASE 都「寫死」為 https://localhost:7181
 */

import { defineStore } from "pinia";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
} from "@microsoft/signalr";

/* ---------------- 型別定義 ---------------- */
export interface MessageDto {
  messageId: number;
  roomId: number;
  userId: number;
  userName: string;
  content: string;
  sentAt: string;
}

export interface RoomListItem {
  roomId: number;
  roomName: string;
  unreadCount: number;
  lastMessage: string;
  lastSentAt: string | null;
}

export interface MemberDto {
  userId: number;
  userName: string;
  isOnline: boolean;
  lastSeen: string | null;
}
export interface RoomWithJoinItem extends RoomListItem {
  hasJoined: boolean;
  eventId: number;
}
/* --------------- 固定後端位址 ---------------- */
const API_BASE = "https://localhost:7181/api";
const HUB_BASE = "https://localhost:7181/hubs/chat";

/* -------------- 主 Store ------------------- */
export const useChatStore = defineStore("chat", {
  state: () => ({
    conn: null as HubConnection | null,
    jwt: "",
    currentUserId: 0,
    rooms: [] as RoomWithJoinItem[],
    currentRoomId: 0,
    messages: [] as MessageDto[],
    members: [] as MemberDto[],
  }),

  actions: {
    /* ===== 初始化 ===== */
    async init(jwt: string, userId: number) {
      this.jwt = jwt;
      this.currentUserId = userId;

      await this.fetchRooms();

      /* 建立 SignalR 連線 */
      this.conn = new HubConnectionBuilder()
        .withUrl(`${HUB_BASE}?access_token=${jwt}`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      /* 監聽事件 */
      this.conn.on("ReceiveMessage", (m: MessageDto) => {
        if (m.roomId === this.currentRoomId) this.messages.push(m);

        const room = this.rooms.find((r) => r.roomId === m.roomId);
        if (room) {
          room.lastMessage = m.content;
          room.lastSentAt = m.sentAt;
          if (m.roomId !== this.currentRoomId) room.unreadCount++;
        }
      });

      this.conn.on("UserJoined", (uid: string) => {
        const member = this.members.find((m) => m.userId === Number(uid));
        if (member) member.isOnline = true;
      });

      await this.conn.start();
    },

    /* ===== 拉房間清單 ===== */
    async fetchRooms() {
      const res = await fetch(`${API_BASE}/chat/rooms`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      });
      this.rooms = await res.json();
    },

    /* ===== 進入房間 ===== */
    async enterRoom(roomId: number) {
      if (this.currentRoomId === roomId) return;

      this.currentRoomId = roomId;
      this.messages = [];
      this.members = [];

      /* a) SignalR 加群組 */
      await this.conn?.invoke("JoinRoom", roomId);

      /* b) 歷史訊息 */
      const msgRes = await fetch(
        `${API_BASE}/chat/rooms/${roomId}/messages?pageSize=50&page=1`,
        { headers: { Authorization: `Bearer ${this.jwt}` } }
      );
      const page = await msgRes.json();
      this.messages = page.items;

      /* c) 成員清單 */
      const memRes = await fetch(`${API_BASE}/chat/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      });
      this.members = await memRes.json();

      /* d) 未讀歸零 */
      const room = this.rooms.find((r) => r.roomId === roomId);
      if (room) room.unreadCount = 0;
    },

    /* ===== 發訊息 ===== */
    async send(text: string) {
      const msg = text.trim();
      if (!msg) return;
      await this.conn?.invoke("SendMessage", this.currentRoomId, msg);
    },
  },
});
