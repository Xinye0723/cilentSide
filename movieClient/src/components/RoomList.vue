<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useChatStore } from "@/stores/chat";

/* ------------- 型別定義：對應後端 RoomWithJoinDto ------------- */
interface RoomWithJoinItem {
  roomId: number;
  roomName: string;
  eventId: number; // ★ 活動 Id
  hasJoined: boolean;
  unreadCount: number;
  lastMessage: string;
  lastSentAt: string | null;
}

const chat = useChatStore();
const rooms = ref<RoomWithJoinItem[]>([]);

/* ----------- 分組 computed ---------- */
const joinedRooms = computed(() => rooms.value.filter((r) => r.hasJoined));
const unjoinedRooms = computed(() => rooms.value.filter((r) => !r.hasJoined));

/* ----------- 監聽 JWT，拿到後 fetch 房間 ---------- */
watch(
  () => chat.jwt,
  async (token) => {
    if (!token) return; // 尚未登入
    try {
      const res = await fetch("https://localhost:7181/api/chat/rooms/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("取房間失敗", res.status);
        return;
      }

      rooms.value = (await res.json()) as RoomWithJoinItem[];
    } catch (err) {
      console.error("RoomList 取得房間錯誤：", err);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-full flex flex-col">
    <h2 class="px-4 py-3 font-semibold border-b border-gray-700">聊天室</h2>

    <!-- 已報名房間 -->
    <ul class="flex-1 overflow-y-auto divide-y divide-gray-700">
      <li
        v-for="r in joinedRooms"
        :key="r.roomId"
        @click="chat.enterRoom(r.roomId)"
        class="px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-800"
        :class="chat.currentRoomId === r.roomId ? 'bg-gray-800' : ''"
      >
        <span class="truncate">{{ r.roomName }}</span>

        <span
          v-if="r.unreadCount"
          class="ml-2 text-xs bg-red-600 rounded-full px-2"
        >
          {{ r.unreadCount }}
        </span>
      </li>

      <!-- 未報名房間 -->
      <li
        v-for="r in unjoinedRooms"
        :key="r.roomId"
        class="px-4 py-2 flex justify-between items-center bg-gray-800/50 text-gray-400"
      >
        <span class="truncate">{{ r.roomName }}</span>
        <router-link
          :to="`/memberEventDetail/${r.eventId}`"
          class="bg-indigo-500 hover:bg-indigo-400 text-xs text-white px-2 py-1 rounded"
        >
          去報名
        </router-link>
      </li>
    </ul>
  </div>
</template>
