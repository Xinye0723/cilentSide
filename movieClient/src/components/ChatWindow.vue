<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();
const bottom = ref<HTMLDivElement>();
const DEFAULT_AVATAR = "https://placehold.co/40x40?text=?";

watch(
  () => chat.messages.length,
  async () => {
    await nextTick();
    bottom.value?.scrollIntoView({ behavior: "smooth" });
  }
);
</script>

<template>
  <!-- 捲動容器 -->
  <div
    class="flex-1 overflow-y-auto p-6 flex flex-col space-y-5"
    style="height: calc(100vh - 140px)"
  >
    <!-- 未選聊天室提示 -->
    <p v-if="chat.currentRoomId === 0" class="text-gray-400 text-center mt-10">
      ← 請先點選左側聊天室開始聊天
    </p>

    <!-- 每條訊息 -->
    <div
      v-for="m in chat.messages"
      :key="m.messageId"
      class="flex items-end gap-2"
      :class="m.userId == chat.currentUserId ? 'flex-row-reverse' : ''"
    >
      <!-- 頭貼 -->
      <img
        :src="chat.avatars[m.userId] || DEFAULT_AVATAR"
        class="w-10 h-10 rounded-full object-cover shrink-0"
      />
      <!-- 泡泡 -->
      <div
        :class="[
          'inline-block max-w-[70%] px-3 py-1.5 rounded-xl shadow-sm whitespace-pre-wrap break-words leading-snug',
          m.userId == chat.currentUserId
            ? 'bg-[#4FC26B] text-white'
            : 'bg-white text-gray-900',
        ]"
      >
        <!-- 名稱放在泡泡外，上方 → 只在第一條或你想顯示時再判斷 -->
        <div>
          <span
            class="text-xs mb-3"
            :class="[
              m.userId == chat.currentUserId
                ? 'text-white-400'
                : 'text-black-400',
            ]"
            v-if="m.userId != chat.currentUserId"
            >{{ m.userName }}</span
          >
        </div>
        {{ m.content }}
      </div>

      <!-- 時間：永遠貼在泡泡旁 -->
      <span
        class="text-[10px] text-gray-400 select-none"
        :class="m.userId == chat.currentUserId ? 'mr-0.5' : 'ml-0.5'"
      >
        {{
          new Date(m.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </span>
    </div>

    <!-- 底部錨點 -->
    <div ref="bottom"></div>
  </div>
</template>
