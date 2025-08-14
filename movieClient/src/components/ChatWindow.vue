<script setup lang="ts">
import { ref, watch, nextTick, computed } from "vue";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();
const bottom = ref<HTMLDivElement>();
const DEFAULT_AVATAR = "https://placehold.co/40x40?text=?";
const scrollBox = ref<HTMLDivElement | null>(null);
/* ---------------- 時間工具：正規化為 UTC，再以台北時區顯示 ---------------- */
function normalizeToUtcIso(input: string | number | Date): string {
  // 1) "2025-08-09T06:31:00"（沒有 Z）→ 視為 UTC，補 Z
  const isoNoZ =
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input);

  // 2) 數字 timestamp 也吃（毫秒）
  // 3) 其他 Date / 含 Z / 含偏移的 ISO 交給 Date 自己解析
  const d = isoNoZ ? new Date(input + "Z") : new Date(input);
  return d.toISOString(); // 標準 UTC（帶 Z）
}

function toTaipeiTimeDisplay(utcIsoLike: string | number | Date): string {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  }).format(new Date(utcIsoLike));
}

/* 將 store 內 messages 轉成「時間已正規化」的資料來源供畫面使用 */
const normalizedMessages = computed(() =>
  chat.messages.map((m: any) => ({
    ...m,
    sentAt: normalizeToUtcIso(m.sentAt),
  }))
);

/* 新訊息出現後，自動捲到底 */
watch(
  () => normalizedMessages.value.length,
  async () => {
    await nextTick();
    const box = scrollBox.value;
    if (!box) return;
    // 只捲動聊天室容器
    box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }
);
</script>

<template>
  <!-- 捲動容器 -->
  <div
    ref="scrollBox"
    class="flex-1 overflow-y-auto p-6 flex flex-col space-y-5"
    style="height: calc(100vh - 140px)"
  >
    <!-- 未選聊天室提示 -->
    <p v-if="chat.currentRoomId === 0" class="text-gray-400 text-center mt-10">
      ← 請先點選左側聊天室開始聊天
    </p>

    <!-- 每條訊息（用 normalizedMessages） -->
    <div
      v-for="m in normalizedMessages"
      :key="m.messageId"
      class="flex items-end gap-2"
      :class="[
        m.userId == chat.currentUserId ? 'flex-row-reverse' : '',
        m.userId === -1 ? 'bot-message' : '',
      ]"
    >
      <!-- 頭貼 -->
      <img
        :src="getBotAvatar(m.userId)"
        class="w-10 h-10 rounded-full object-cover shrink-0"
      />

      <!-- 泡泡 -->
      <div
        :class="[
          'inline-block max-w-[70%] px-3 py-1.5 rounded-xl shadow-sm whitespace-pre-wrap break-words leading-snug',
          getBubbleStyle(m.userId),
        ]"
      >
        <!-- 名稱（僅對方顯示） -->
        <div>
          <span
            class="text-xs mb-3"
            :class="[
              m.userId == chat.currentUserId
                ? 'text-white/70'
                : 'text-black/60',
            ]"
            v-if="m.userId != chat.currentUserId"
            >{{ m.userName }}</span
          >
        </div>
        {{ m.content }}
      </div>

      <!-- 時間（固定用台北時區） -->
      <span
        class="text-[10px] text-gray-400 select-none"
        :class="m.userId == chat.currentUserId ? 'mr-0.5' : 'ml-0.5'"
      >
        {{ toTaipeiTimeDisplay(m.sentAt) }}
      </span>
    </div>

    <!-- 底部錨點 -->
    <div ref="bottom"></div>
  </div>
</template>

<style scoped>
.bot-message {
  animation: fadeInBot 0.5s ease-in;
}

@keyframes fadeInBot {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
