// ======================================================================
//  stores/chat.ts   （Pinia 聊天/Presence 狀態）
// ----------------------------------------------------------------------
//  - SignalR + JWT；多連線 presence 同步 (UserJoined / UserLeft / SyncOnlineList)
//  - rooms / messages / members 依 API 分頁 & 應答
// ======================================================================
import { defineStore } from "pinia";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
} from "@microsoft/signalr";

/* ---------- 型別 ---------- */
export interface MessageDto {
  messageId: number | string;
  roomId: number;
  userId: number;
  userName: string;
  content: string;
  sentAt: string;
}

export interface MemberDto {
  userId: number;
  userName: string;
  avatarPath?: string | null;
  isOnline: boolean;
  lastSeen: string | null;
}

export interface RoomWithJoinItem {
  roomId: number;
  roomName: string;
  unreadCount: number;
  lastMessage: string;
  lastSentAt: string | null;
  hasJoined: boolean;
  eventId: number;
}

/* ---------- 常數：依你專案改 base URL ---------- */
const API_BASE = "https://localhost:7181/api";
const HUB_BASE = "https://localhost:7181/hubs/chat";
const LS_UID_KEY = "memberid";
const STATIC_BASE = "https://localhost:7181"; // wwwroot
const DEFAULT_AVA = "https://placehold.co/40x40?text=?";

export const useChatStore = defineStore("chat", {
  state: () => ({
    /* SignalR */
    conn: null as HubConnection | null,
    jwt: "",

    /* 個人 */
    currentUserId: Number(localStorage.getItem(LS_UID_KEY)) || 0,

    /* 房間 / 成員 / 訊息 */
    rooms: [] as RoomWithJoinItem[],
    messages: [] as MessageDto[],
    members: [] as MemberDto[],
    currentRoomId: 0,

    /* 頭像快取 userId → url */
    avatars: {} as Record<number, string>,
  }),

  actions: {
    /* ========== 1. 初始化（登入完呼叫一次） ========== */
    async init(jwt: string, userId: number) {
      /* 1️⃣ 基本欄位 */
      this.jwt = jwt;
      this.currentUserId = userId;
      localStorage.setItem(LS_UID_KEY, String(userId));

      /* 2️⃣ REST 拉房間清單 (之後 UI 左側會用到) */
      await this.fetchRooms();

      /* 3️⃣ 建立 SignalR 連線 */
      this.conn = new HubConnectionBuilder()
        .withUrl(HUB_BASE, { accessTokenFactory: () => jwt })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      /* 3-1 收新訊息（只針對已 Join 的 room） */
      this.conn.on("ReceiveMessage", (msg: MessageDto) => {
        msg.roomId = Number(msg.roomId);
        msg.userId = Number(msg.userId);

        /* 只顯示當前房間的訊息 */
        if (msg.roomId !== this.currentRoomId) return;
        if (!this.messages.find((x) => x.messageId === msg.messageId))
          this.messages.push(msg);
      });

      /* 3-2 Presence 事件 */
      this.conn.on("SyncOnlineList", (ids: number[]) => {
        this.members.forEach((m) => (m.isOnline = ids.includes(m.userId)));
      });
      this.conn.on("UserJoined", (uid: number) => {
        const m = this.members.find((x) => x.userId === uid);
        if (m) m.isOnline = true;
      });
      this.conn.on("UserLeft", (uid: number) => {
        const m = this.members.find((x) => x.userId === uid);
        if (m) {
          m.isOnline = false;
          m.lastSeen = new Date().toISOString();
        }
      });

      /* 4️⃣ 斷線重連後自動重新加入房間 */
      this.conn.onreconnected(() => {
        if (this.currentRoomId)
          this.conn!.invoke("JoinRoom", this.currentRoomId);
      });

      /* 5️⃣ start 連線 */
      await this.conn.start();

      /* 6️⃣ 分頁關閉時 stop，避免殭屍連線 */
      window.addEventListener("beforeunload", () => this.conn?.stop());
    },

    /* ========== 2. 房間清單 (左側列表) ========== */
    async fetchRooms() {
      const res = await fetch(`${API_BASE}/chat/rooms`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      });
      this.rooms = await res.json();
    },

    /* ========== 3. 進入/切換房間 ========== */
    async enterRoom(roomId: number) {
      if (this.currentRoomId === roomId) return;

      /* A. 離開舊房 (若有) */
      if (this.currentRoomId)
        await this.conn?.invoke("LeaveRoom", this.currentRoomId);

      /* B. 清空畫面資料 */
      this.currentRoomId = roomId;
      this.messages = [];
      this.members = [];

      /* C. REST 取歷史訊息 (50 筆) */
      const msgPage = await fetch(
        `${API_BASE}/chat/rooms/${roomId}/messages?pageSize=50&page=1`,
        { headers: { Authorization: `Bearer ${this.jwt}` } }
      ).then((r) => r.json());
      this.messages = msgPage.items.map((m: MessageDto) => ({
        ...m,
        roomId: Number(m.roomId),
        userId: Number(m.userId),
      }));

      /* D. REST 取成員清單 */
      this.members = await fetch(`${API_BASE}/chat/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      }).then((r) => r.json());

      /* E. 頭像緩存 */
      this.members.forEach((m) => {
        this.avatars[m.userId] = m.avatarPath
          ? new URL(m.avatarPath, STATIC_BASE).href
          : DEFAULT_AVA;
      });

      /* F. JoinRoom → 之後才會收到 ReceiveMessage */
      await this.conn?.invoke("JoinRoom", roomId);

      /* G. 歸零未讀 */
      const room = this.rooms.find((r) => r.roomId === roomId);
      if (room) room.unreadCount = 0;
    },

    /* ========== 4. 發訊息 ========== */
    async send(text: string) {
      const msg = text.trim();
      if (!msg) return;
      await this.conn?.invoke("SendMessage", this.currentRoomId, msg);
    },
  },
});
