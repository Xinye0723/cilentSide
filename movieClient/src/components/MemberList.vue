<!--
  右側成員清單：線上 / 離線 分兩組
-->
<script setup lang="ts">
import { computed } from "vue";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();

const online = computed(() => chat.members.filter((m) => m.isOnline));
const offline = computed(() => chat.members.filter((m) => !m.isOnline));
</script>

<template>
  <div class="h-full flex flex-col border-l border-gray-700">
    <h2 class="px-4 py-3 font-semibold border-b border-gray-700">成員</h2>

    <!-- 在線 -->
    <div class="px-4 py-2 text-green-400">● 在線 ({{ online.length }})</div>
    <ul class="px-4 space-y-1">
      <li v-for="m in online" :key="m.userId">{{ m.userName }}</li>
    </ul>

    <!-- 離線 -->
    <div class="px-4 py-2 mt-4 text-gray-400">
      ○ 離線 ({{ offline.length }})
    </div>
    <ul class="px-4 space-y-1 text-gray-400 text-sm">
      <li v-for="m in offline" :key="m.userId">
        <span>{{ m.userName }}</span>
        <span v-if="m.lastSeen" class="ml-1 text-[10px]">
          ({{ new Date(m.lastSeen).toLocaleDateString() }})
        </span>
      </li>
    </ul>
  </div>
</template>
