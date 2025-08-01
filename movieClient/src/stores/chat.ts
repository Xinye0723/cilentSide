import { defineStore } from "pinia";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
} from "@microsoft/signalr";

/* ---------- 型別 ---------- */
export interface MessageDto {
  messageId: number | string;
  roomId: number | string;
  userId: number | string;
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

/* ---------- 常數 ---------- */
const API_BASE = "https://localhost:7181/api";
const HUB_BASE = "https://localhost:7181/hubs/chat";
const LS_MEMBER_KEY = "memberid";
const STATIC_BASE = "https://localhost:7181"; // wwwroot 對外根
const DEFAULT_AVATAR = "https://placehold.co/40x40?text=?";

export const useChatStore = defineStore("chat", {
  state: () => ({
    conn: null as HubConnection | null,
    jwt: "",
    currentUserId: Number(localStorage.getItem(LS_MEMBER_KEY)) || 0,

    rooms: [] as RoomWithJoinItem[],
    currentRoomId: 0,

    messages: [] as MessageDto[],
    members: [] as MemberDto[],

    avatars: {} as Record<number, string>, // userId → avatarUrl
  }),

  actions: {
    /* ===== 初始化 ===== */
    async init(jwt: string, userId: number | string) {
      this.jwt = jwt;
      this.currentUserId = Number(userId);
      localStorage.setItem(LS_MEMBER_KEY, String(userId));

      await this.fetchRooms();

      this.conn = new HubConnectionBuilder()
        .withUrl(`${HUB_BASE}?access_token=${jwt}`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      /* ===== 即時訊息監聽 ===== */
      this.conn.on("ReceiveMessage", (msg: MessageDto) => {
        msg.userId = Number(msg.userId);
        msg.roomId = Number(msg.roomId);

        if (msg.roomId !== this.currentRoomId) return;

        /* 去重：若已存在相同 messageId 就跳過 */
        if (!this.messages.find((x) => x.messageId === msg.messageId)) {
          this.messages.push(msg);
        }

        const room = this.rooms.find((r) => r.roomId === msg.roomId);
        if (room) {
          room.lastMessage = msg.content;
          room.lastSentAt = msg.sentAt;
          if (msg.roomId !== this.currentRoomId) room.unreadCount++;
        }
      });

      /* 線上狀態推播 */
      this.conn.on("UserJoined", (uid: string) => {
        const member = this.members.find((m) => m.userId === Number(uid));
        if (member) member.isOnline = true;
      });

      await this.conn.start();
    },

    /* ===== 房間清單 ===== */
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

      /* 1️⃣ 先拉歷史訊息 */
      const msgRes = await fetch(
        `${API_BASE}/chat/rooms/${roomId}/messages?pageSize=50&page=1`,
        { headers: { Authorization: `Bearer ${this.jwt}` } }
      );
      const page = await msgRes.json();
      this.messages = page.items.map((m: MessageDto) => ({
        ...m,
        userId: Number(m.userId),
        roomId: Number(m.roomId),
      }));

      /* 2️⃣ 再加入 SignalR 群組 —— 之後 ReceiveMessage 只收新訊息 */
      await this.conn?.invoke("JoinRoom", roomId);

      /* 3️⃣ 成員清單 */
      const memRes = await fetch(`${API_BASE}/chat/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      });
      this.members = (await memRes.json()).map((m: MemberDto) => ({
        ...m,
        userId: Number(m.userId),
      }));

      /* 4️⃣ 頭像 URL */
      this.members.forEach((m: MemberDto) => {
        this.avatars[m.userId] = m.avatarPath
          ? new URL(m.avatarPath, STATIC_BASE).href // https://localhost:7181/images/posterPicture/xxx.png
          : DEFAULT_AVATAR;
      });

      /* 5️⃣ 未讀歸零 */
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
