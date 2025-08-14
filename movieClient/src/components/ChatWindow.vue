<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();
const bottom = ref<HTMLDivElement>();
const DEFAULT_AVATAR = "https://placehold.co/40x40?text=?";

function getBotAvatar(userId: number) {
  if (userId === -1) {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Rjc5QTQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIj4KICA8dGV4dCB4PSIxMiIgeT0iMTgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+🤖PC90ZXh0Pgo8L3N2Zz4KPC9zdmc+"; // 機器人頭像
  }
  return chat.avatars[userId] || DEFAULT_AVATAR;
}

function getBubbleStyle(userId: number) {
  if (userId === chat.currentUserId) {
    return 'bg-[#4FC26B] text-white';
  } else if (userId === -1) {
    return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'; // 機器人特殊樣式
  } else {
    return 'bg-white text-gray-900';
  }
}

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
      :class="[
        m.userId == chat.currentUserId ? 'flex-row-reverse' : '',
        m.userId === -1 ? 'bot-message' : ''
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
          getBubbleStyle(m.userId)
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
