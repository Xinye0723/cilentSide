<!-- RightMemberList.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();

/* 線上 / 離線成員分組 */
const online = computed(() => chat.members.filter((m) => m.isOnline));
const offline = computed(() => chat.members.filter((m) => !m.isOnline));

/* 目前登入者 ID（假設 Pinia 內有 currentUserId） */
const currentUserId = computed(() => chat.currentUserId);
</script>

<template>
  <div class="h-full flex flex-col border-l border-gray-700">
    <h2 class="px-4 py-3 font-semibold border-b border-gray-700">成員</h2>

    <!-- 在線 -->
    <div class="px-4 py-2 text-green-400">● 在線 ({{ online.length }})</div>
    <ul class="px-4 space-y-1">
      <li
        v-for="m in online"
        :key="m.userId"
        :class="[
          'px-2',
          m.userId === currentUserId // 如果是自己 → 黃色 + 粗體
            ? 'text-yellow-400 font-semibold'
            : 'text-white', // 其他在線成員 → 白字
        ]"
      >
        {{ m.userName }}
      </li>
    </ul>

    <!-- 離線 -->
    <div class="px-4 py-2 mt-4 text-gray-400">
      ○ 離線 ({{ offline.length }})
    </div>
    <ul class="px-4 space-y-1 text-sm">
      <li
        v-for="m in offline"
        :key="m.userId"
        :class="[
          'px-2',
          m.userId === currentUserId
            ? 'text-yellow-400 font-semibold'
            : 'text-gray-400',
        ]"
      >
        <span>{{ m.userName }}</span>
        <span v-if="m.lastSeen" class="ml-1 text-[10px]">
          ({{ new Date(m.lastSeen).toLocaleDateString() }})
        </span>
      </li>
    </ul>
  </div>
</template>
