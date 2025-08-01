<script setup lang="ts">
/* ---------------------------------------------
 * ChatApp.vue
 * ---------------------------------------------
 * - 讀 localStorage.token 及 memberId
 * - 若不存在 → router.push("/login")
 * - 若存在 → chatStore.init() 建立 SignalR 連線
 * -------------------------------------------*/

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";

import RoomList from "@/components/RoomList.vue";
import ChatWindow from "@/components/ChatWindow.vue";
import MemberList from "@/components/MemberList.vue";
import TickerBar from "@/views/TickerBar.vue";
import ChatInput from "./ChatInput.vue";
/* Pinia store 與 router */
const chat = useChatStore();
const router = useRouter();

/* 訊息輸入框 v-model */
const text = ref("");

/* 初始化 */
onMounted(async () => {
  const jwt = localStorage.getItem("token");
  const uid = Number(localStorage.getItem("memberId"));

  if (!jwt || !uid) {
    router.push("/login"); // 未登入 → 去登入頁
    return;
  }

  try {
    await chat.init(jwt, uid); // 建立 SignalR 連線＋抓房間
  } catch (err) {
    console.error("Chat 初始化失敗：", err);
    router.push("/login");
  }
});

/* 送訊息 */
function sendMsg() {
  if (!text.value.trim()) return;
  chat.send(text.value);
  text.value = "";
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
    <!-- 左：房間清單 -->
    <aside class="w-72 border-r border-gray-700 overflow-hidden">
      <RoomList />
    </aside>

    <!-- 中：聊天視窗 -->
    <section class="flex flex-col flex-1">
      <ChatWindow class="flex-1 overflow-y-auto" />
      <ChatInput></ChatInput>
      <!-- <div class="p-4 border-t border-gray-700 flex space-x-2">
        <input
          v-model="text"
          @keyup.enter="sendMsg"
          class="flex-1 bg-gray-800 rounded px-4 py-2 outline-none"
          placeholder="輸入訊息後按 Enter 送出"
        />
        <button
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-40"
          :disabled="!text.trim()"
          @click="sendMsg"
        >
          送出
        </button>
      </div> -->
    </section>

    <!-- 右：成員清單 -->
    <aside class="w-60 border-l border-gray-700 overflow-hidden">
      <MemberList />
    </aside>
  </div>
  <!-- <TickerBar text="🎉 7/31 Press Demo ‧ 線上聊天室正式啟用！" /> -->
</template>

<style scoped>
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
