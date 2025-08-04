<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useChatStore } from "@/stores/chat";

/* ---------- 型別 ---------- */
interface RoomWithJoinItem {
  roomId: number;
  roomName: string;
  eventId: number;
  hasJoined: boolean;
  unreadCount: number;
  lastMessage: string;
  lastSentAt: string | null;
}

const chat = useChatStore();
const rooms = ref<RoomWithJoinItem[]>([]);

/* -------- 分組 -------- */
const joinedRooms = computed(() => rooms.value.filter((r) => r.hasJoined));
const unjoinedRooms = computed(() => rooms.value.filter((r) => !r.hasJoined));

/* -------- 點擊切房：包一層 await，錯誤有 log -------- */
async function enter(roomId: number) {
  try {
    await chat.enterRoom(roomId);
  } catch (err) {
    console.error("enterRoom 失敗：", err);
  }
}

/* -------- JWT 變化就拉房間 -------- */
watch(
  () => chat.jwt,
  async (token) => {
    if (!token) return;
    const res = await fetch("https://localhost:7181/api/chat/rooms/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) rooms.value = (await res.json()) as RoomWithJoinItem[];
    else console.error("取房間清單失敗", res.status);
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-full flex flex-col">
    <h2 class="px-4 py-3 font-semibold border-b border-gray-700">聊天室</h2>

    <ul class="flex-1 overflow-y-auto divide-y divide-gray-700">
      <!-- 已加入的房間 -->
      <li
        v-for="r in joinedRooms"
        :key="r.roomId"
        class="px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-800"
        :class="chat.currentRoomId === r.roomId ? 'bg-gray-800' : ''"
        @click="enter(r.roomId)"
      >
        <span class="truncate">{{ r.roomName }}</span>
        <span
          v-if="r.unreadCount"
          class="ml-2 text-xs bg-red-600 rounded-full px-2"
        >
          {{ r.unreadCount }}
        </span>
      </li>

      <!-- 未加入（未報名）的房間 -->
      <li
        v-for="r in unjoinedRooms"
        :key="r.roomId"
        class="px-4 py-2 flex justify-between items-center bg-gray-800/50 text-gray-400"
      >
        <span class="truncate">{{ r.roomName }}</span>

        <!-- router-link 要加 stop，避免點內文誤觸 li -->
        <router-link
          :to="`/memberEventDetail/${r.eventId}`"
          @click.stop
          class="bg-indigo-500 hover:bg-indigo-400 text-xs text-white px-2 py-1 rounded"
        >
          去報名
        </router-link>
      </li>
    </ul>
  </div>
</template>
