// ======================================================================
//  stores/chat.ts   （Pinia 聊天/Presence 狀態）— 方案 A：被擋不顯示泡泡，改用 SweetAlert 提示
// ----------------------------------------------------------------------
//  - SignalR + JWT；多連線 presence 同步 (UserJoined / UserLeft / SyncOnlineList)
//  - rooms / messages / members 依 API 分頁 & 應答
//  - 強化：pending 審查中泡泡、限流、錯誤回饋（HubException）
//  - 修正：所有時間正規化為 UTC ISO（帶 Z），顯示時再轉台北時區
//  - 新增：ModerationBlocked 來時「移除 pending」+ SweetAlert 提示（不留失敗泡泡）
// ======================================================================
import { defineStore } from "pinia";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
} from "@microsoft/signalr";
import Swal from "sweetalert2";

/* ---------- 型別 ---------- */
export interface MessageDto {
  messageId: number | string;
  roomId: number;
  userId: number;
  userName: string;
  content: string;
  sentAt: string; // 後端可能回「無 Z 的 ISO」或各種格式
}

export interface MemberDto {
  userId: number;
  userName: string;
  avatarPath?: string | null;
  isOnline: boolean;
  lastSeen: string | null; // 可能為 null / 無 Z ISO
}

export interface RoomWithJoinItem {
  roomId: number;
  roomName: string;
  unreadCount: number;
  lastMessage: string;
  lastSentAt: string | null; // 可能為 null / 無 Z ISO
  hasJoined: boolean;
  eventId: number;
}

/* ---------- UI 專用訊息型別（不影響後端 DTO） ---------- */
interface UIMessage extends MessageDto {
  _pending?: boolean; // 審查中
  _failed?: boolean; // 被擋/送出錯誤
  errorMsg?: string | null; // 錯誤說明
}

/* ---------- 常數：依你專案改 base URL ---------- */
const API_BASE = "https://localhost:7181/api";
const HUB_BASE = "https://localhost:7181/hubs/chat";
const LS_UID_KEY = "memberid";
const STATIC_BASE = "https://localhost:7181"; // wwwroot
const DEFAULT_AVA = "https://placehold.co/40x40?text=?";

/* ---------- 發送節流（與後端保持一致） ---------- */
const COOLDOWN_MS = 1200;

/* ---------- 小工具：時間正規化 ---------- */
/** 將各式時間（無 Z 的 ISO / 有偏移的 ISO / timestamp / Date）→ 標準 UTC ISO（帶 Z） */
function normalizeToUtcIso(
  input: string | number | Date | null | undefined
): string | null {
  if (input == null) return null;
  const isIsoNoZ =
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input); // e.g. "2025-08-09T06:31:00"
  const d = isIsoNoZ ? new Date(input + "Z") : new Date(input as any);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
function nowIso() {
  return new Date().toISOString();
}
function genTempId() {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
export function formatTPE(isoUtc: string | null) {
  if (!isoUtc) return "";
  return new Date(isoUtc).toLocaleTimeString("zh-TW", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Taipei",
  });
}

/* 安全字串顯示（SweetAlert 內容 escape） */
function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    /* SignalR */
    conn: null as HubConnection | null,
    jwt: "",

    /* 個人 */
    currentUserId: Number(localStorage.getItem(LS_UID_KEY)) || 0,

    /* 房間 / 成員 / 訊息 */
    rooms: [] as RoomWithJoinItem[],
    messages: [] as UIMessage[],
    members: [] as MemberDto[],
    currentRoomId: 0,

    /* 頭像快取 userId → url */
    avatars: {} as Record<number, string>,

    /* 限流時間戳 */
    _lastSentAt: 0,
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

        // **正規化時間**
        const norm = normalizeToUtcIso(msg.sentAt);
        msg.sentAt = norm ?? nowIso();

        // 只顯示當前房間
        if (msg.roomId !== this.currentRoomId) return;

        // ① 先找 pending 同內容同使用者 → 用正式訊息替換
        const idxPending = this.messages.findIndex(
          (m) =>
            m._pending &&
            m.roomId === msg.roomId &&
            m.userId === msg.userId &&
            m.content === msg.content
        );
        if (idxPending >= 0) {
          this.messages[idxPending] = { ...msg }; // 替換掉 pending
          return;
        }

        // ② 避免重複（依 messageId）
        if (!this.messages.find((x) => x.messageId === msg.messageId)) {
          this.messages.push({ ...msg });
        }
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
          m.lastSeen = nowIso(); // 這裡我們用本機 UTC ISO
        }
      });

      /* 3-3 Azure 審查事件：被封鎖（移除 pending，不顯示泡泡） */
      this.conn.on("ModerationBlocked", (payload: any) => {
        // payload: { roomId, text, suggestion, reasons: [{Category, Severity}, ...] }
        const roomId = Number(payload.roomId);
        const text = String(payload.text ?? "");
        if (roomId !== this.currentRoomId) return;

        // 找到同一則 pending（用 roomId + 自己 userId + content 比對）
        const idx = this.messages.findIndex(
          (m) =>
            m._pending &&
            m.roomId === roomId &&
            m.userId === this.currentUserId &&
            m.content === text
        );

        // 找到就直接移除，不留任何失敗泡泡；找不到也不補任何訊息
        if (idx >= 0) this.messages.splice(idx, 1);

        // SweetAlert 提示（不影響訊息串）
        const reasons =
          (payload.reasons || [])
            .map((r: any) => `${r.Category}（嚴重度 ${r.Severity}）`)
            .join("、") || "未提供";
        const hint = payload.suggestion || "訊息包含敏感或不當內容，已被攔截。";

        Swal.fire({
          icon: "warning",
          title: "訊息未送出",
          html: `
              <div style="margin-top:6px;">${escapeHtml(hint)}</div>
            </div>
          `,
          confirmButtonText: "了解",
        });
      });

      /* 3-4 Azure 審查事件：僅標記（未封鎖） */
      this.conn.on("ModerationFlagged", (payload: any) => {
        // 可彈出 Toast；這裡先簡單記錄在 console
        const reasons =
          (payload.reasons || [])
            .map((r: any) => `${r.Category}（嚴重度 ${r.Severity}）`)
            .join("、") || "未提供";
        const hint = payload.suggestion || "訊息包含敏感字詞，請留意用詞。";
        console.info(`⚠️ 審查提醒：${hint}｜${reasons}`);
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
      const rooms = (await res.json()) as RoomWithJoinItem[];

      // **正規化 lastSentAt**
      rooms.forEach((r) => {
        r.lastSentAt = normalizeToUtcIso(r.lastSentAt) as string | null;
      });

      this.rooms = rooms;
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

      // **正規化歷史訊息 sentAt + 數值型別**
      this.messages = msgPage.items.map((m: MessageDto) => {
        const sentAt = normalizeToUtcIso(m.sentAt) ?? nowIso();
        return {
          ...m,
          roomId: Number(m.roomId),
          userId: Number(m.userId),
          sentAt,
        };
      });

      /* D. REST 取成員清單 */
      const members = (await fetch(`${API_BASE}/chat/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      }).then((r) => r.json())) as MemberDto[];

      // **正規化成員 lastSeen**
      this.members = members.map((m) => ({
        ...m,
        lastSeen: normalizeToUtcIso(m.lastSeen),
      }));

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

    /* ========== 4. 發訊息（含 pending/限流/錯誤處理） ========== */
    async send(text: string) {
      const content = text.trim();
      if (!content || !this.conn || !this.currentRoomId) return;

      // 限流（與後端 COOLDOWN_MS 同步）
      const now = Date.now();
      if (now - this._lastSentAt < COOLDOWN_MS) {
        console.info("發太快啦～稍等一下");
        return;
      }
      this._lastSentAt = now;

      // 先插入 pending 泡泡（審查中）
      const tempId = genTempId();
      const me =
        this.members.find((m) => m.userId === this.currentUserId)?.userName ??
        "我";
      const pending: UIMessage = {
        messageId: tempId,
        roomId: this.currentRoomId,
        userId: this.currentUserId,
        userName: me,
        content,
        sentAt: nowIso(), // 送出一律用 UTC ISO
        _pending: true,
        _failed: false,
        errorMsg: null,
      };
      this.messages.push(pending);

      // 送給 Hub → 後端做 Azure AI 審查
      try {
        await this.conn.invoke("SendMessage", this.currentRoomId, content);
        // 伺服器回正式訊息後會在 on("ReceiveMessage") 用同 user + content 替換，不在此 push
      } catch (err: any) {
        // HubException（例如違反規範）→ 把 pending 改成失敗樣式
        const i = this.messages.findIndex((m) => m.messageId === tempId);
        if (i >= 0) {
          this.messages[i]._pending = false;
          this.messages[i]._failed = true;
          this.messages[i].errorMsg = err?.message ?? "送出失敗，請稍後再試";
        }
      }

      // 保險：若 10 秒內沒被替換成正式訊息，就當失敗
      setTimeout(() => {
        const i = this.messages.findIndex(
          (m) => m.messageId === tempId && m._pending
        );
        if (i >= 0) {
          this.messages[i]._pending = false;
          this.messages[i]._failed = true;
          this.messages[i].errorMsg = "逾時未送達或被系統攔截";
        }
      }, 10000);
    },
  },
});
