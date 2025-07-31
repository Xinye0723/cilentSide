<!--
  中間訊息滾動區
  ------------------------------------------------
  1) v-for 顯示氣泡
  2) watch 訊息長度 → 自動捲到最底
-->
<script setup lang="ts">
import { useChatStore } from "@/stores/chat";
import { nextTick, ref, watch } from "vue";

const chat = useChatStore();
/** 底部錨點，用來做 scrollIntoView */
const bottom = ref<HTMLDivElement>();

/* 每當訊息數量變化，等待 DOM 更新後捲到底 */
watch(
  () => chat.messages.length,
  async () => {
    await nextTick();
    bottom.value?.scrollIntoView({ behavior: "smooth" });
  }
);
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    <template v-if="chat.currentRoomId === 0">
      <p class="text-gray-400 text-center mt-10">
        ← 請先點選左側聊天室開始聊天
      </p>
    </template>

    <!-- 訊息氣泡 -->
    <div
      v-for="m in chat.messages"
      :key="m.messageId"
      :class="[
        'max-w-md px-4 py-2 rounded break-words',
        m.userId === chat.currentUserId
          ? 'ml-auto bg-indigo-600'
          : 'bg-gray-700',
      ]"
    >
      <!-- 使用者名稱（自家訊息就隱藏） -->
      <p
        v-if="m.userId !== chat.currentUserId"
        class="text-xs text-gray-300 mb-1"
      >
        {{ m.userName }}
      </p>

      <!-- 內容 -->
      <p>{{ m.content }}</p>

      <!-- 時間戳 -->
      <p class="text-[10px] text-right text-gray-300 mt-1">
        {{ new Date(m.sentAt).toLocaleTimeString() }}
      </p>
    </div>

    <!-- 錨點 -->
    <div ref="bottom"></div>
  </div>
</template>
