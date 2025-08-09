<script setup lang="ts">
import { ref, onMounted } from "vue";
import { EmojiButton } from "@joeattardi/emoji-button";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();
const input = ref<HTMLInputElement>();
const btn = ref<HTMLButtonElement>();

onMounted(() => {
  const picker = new EmojiButton({
    position: "top-start",
    theme: "auto",
  });

  // 選到表情插入光標
  picker.on("emoji", ({ emoji }) => {
    const el = input.value!;
    const [start, end] = [el.selectionStart!, el.selectionEnd!];
    el.value = el.value.slice(0, start) + emoji + el.value.slice(end);
    el.focus();
    el.selectionStart = el.selectionEnd = start + emoji.length;
  });

  btn.value?.addEventListener("click", () => picker.togglePicker(btn.value!));
});

function handleSend() {
  if (!input.value) return;
  const msg = input.value.value.trim();
  if (!msg) return; // 避免空白
  chat.send(msg); // 交給 store
  input.value.value = "";
}
</script>

<template>
  <div class="flex items-center gap-2 p-4 border-t border-gray-700">
    <button ref="btn" class="text-xl hover:opacity-80">😊</button>
    <input
      ref="input"
      class="flex-1 bg-gray-800 rounded px-3 py-2 text-sm outline-none"
      placeholder="輸入訊息…"
      @keydown.enter.prevent="handleSend"
    />

    <button
      class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded px-3 py-1.5"
      @click="handleSend"
    >
      送出
    </button>
  </div>
</template>
