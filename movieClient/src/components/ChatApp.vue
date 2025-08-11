<script setup lang="ts">
/* ---------------------------------------------
 * ChatApp.vue (改寫後)
 * ---------------------------------------------
 * - 改成從 Pinia 的 useAuthStore 取得 memberId / token
 * - 若未登入 → router.push("/login")
 * - 若已登入 → chatStore.init() 建立 SignalR 連線
 * -------------------------------------------*/

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth"; // ★ 改用 auth store

import RoomList from "@/components/RoomList.vue";
import ChatWindow from "@/components/ChatWindow.vue";
import MemberList from "@/components/MemberList.vue";
import TickerBar from "@/views/TickerBar.vue";
import ChatInput from "./ChatInput.vue";

/* Pinia store 與 router */
const chat = useChatStore();
const auth = useAuthStore(); // ★
const router = useRouter();

/* 訊息輸入框 v-model */
const text = ref("");

/* 初始化 */
onMounted(async () => {
  // 先確保 auth 有同步到 state（如果還沒，就從 localStorage 遷移）
  if (!auth.isLoggedIn) {
    auth.initFromLocalStorage();
  }

  if (!auth.isLoggedIn) {
    router.push("/login");
    return;
  }

  try {
    // 使用 auth store 的 token 與 memberId
    await chat.init(auth.token!, Number(auth.memberId));
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
    </section>

    <!-- 右：成員清單 -->
    <aside class="w-60 border-l border-gray-700 overflow-hidden">
      <MemberList />
    </aside>
  </div>
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
