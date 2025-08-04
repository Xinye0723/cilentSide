<script setup lang="ts">
import { computed } from "vue";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();

const online = computed(() => chat.members.filter((m) => m.isOnline));
const offline = computed(() => chat.members.filter((m) => !m.isOnline));
const myId = computed(() => chat.currentUserId);
</script>

<template>
  <div class="h-full flex flex-col border-l border-gray-700 text-sm">
    <h2 class="px-4 py-3 font-semibold border-b border-gray-700">成員</h2>

    <!-- 在線 -->
    <div class="px-4 py-2 flex items-center text-green-400 font-medium">
      ● 在線&nbsp;({{ online.length }})
    </div>
    <ul class="px-4 space-y-1">
      <li
        v-for="m in online"
        :key="m.userId"
        class="px-2 leading-6 truncate"
        :class="
          m.userId === myId ? 'text-yellow-400 font-semibold' : 'text-white'
        "
      >
        {{ m.userName }}
      </li>
    </ul>

    <!-- 離線 -->
    <div class="px-4 py-2 mt-4 text-gray-400 flex items-center font-medium">
      ○ 離線&nbsp;({{ offline.length }})
    </div>
    <ul class="px-4 space-y-1">
      <li
        v-for="m in offline"
        :key="m.userId"
        class="px-2 leading-6 text-gray-400 truncate"
      >
        <span>{{ m.userName }}</span>
        <span v-if="m.lastSeen" class="ml-1 text-[10px] opacity-70">
          ({{ new Date(m.lastSeen).toLocaleDateString() }})
        </span>
      </li>
    </ul>
  </div>
</template>
