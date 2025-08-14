<template>
  <div 
    class="fixed bottom-6 right-6 z-[9999]"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px'
    }"
  >
    <!-- 🎬 配合影城風格的聊天視窗 -->
    <div 
      v-if="isOpen" 
      class="absolute bottom-16 right-0 w-96 h-[450px] bg-gradient-to-b from-slate-900 to-black rounded-xl shadow-2xl border border-white/10 flex flex-col z-50 overflow-hidden backdrop-blur-md"
    >
      <!-- ✨ 影城主題標題列 -->
      <div class="bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 text-white p-3 rounded-t-xl flex justify-between items-center relative overflow-hidden">
        <!-- 背景動畫效果 -->
        <div class="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-red-400/30 to-purple-500/30 animate-pulse"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
        
        <div class="flex items-center gap-2 relative z-10">
          <div class="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-pink-200 animate-bounce backdrop-blur-sm">
            <span class="text-2xl font-bold">∞</span>
          </div>
          <span class="font-bold text-lg tracking-wide">INFINITY</span>
        </div>
        
        <button 
          @click="isOpen = false" 
          class="relative z-10 text-white hover:text-pink-200 font-bold text-lg transition-all duration-200 hover:scale-110 transform hover:rotate-90"
        >
          ✕
        </button>
      </div>
      
      <!-- 🌟 訊息區域 - 深色電影院氛圍 -->
      <div ref="messageContainer" class="flex-1 p-4 overflow-y-auto bg-slate-900/90 backdrop-blur-sm custom-scrollbar">
        <!-- 歡迎訊息 -->
        <div v-if="messages.length === 0" class="text-slate-300 text-sm leading-relaxed">
          <div class="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-lg p-3 mb-3 backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-pink-400 text-lg">
                <svg class="w-4 h-2 inline" viewBox="0 0 80 32" fill="none">
                  <path d="M16 16c0-6 4-10 10-10s10 4 10 10-4 10-10 10-10-4-10-10z M38 16c0 6 4 10 10 10s10-4 10-10-4-10-10-10-10 4-10 10z" stroke="currentColor" stroke-width="2.5" fill="none"/>
                  <circle cx="20" cy="16" r="2" fill="currentColor"/>
                  <circle cx="54" cy="16" r="2" fill="currentColor"/>
                </svg>
              </span>
              <span class="text-pink-300 font-semibold">您好！我是客服助手InfiMini</span>
            </div>
            <p class="text-slate-300 text-xs">
              是您的專屬AI影城助手！<br>
              🎬 試試問我「現在有什麼電影」<br>
              📅 或「鬼滅的場次」
            </p>
          </div>
        </div>
        
        <!-- 對話訊息 -->
        <div v-for="(msg, i) in messages" :key="i" class="mb-3">
          <!-- 用戶訊息 -->
          <div v-if="msg.type === 'user'" class="text-right">
            <div class="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-2xl text-sm shadow-lg max-w-xs">
              {{ msg.content }}
            </div>
          </div>
          <!-- AI訊息 - 改善排版顯示 -->
          <div v-else class="text-left">
            <div class="flex items-start gap-2">
              <div class="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1">
                <svg class="w-4 h-2" viewBox="0 0 80 32" fill="none">
                  <path d="M16 16c0-6 4-10 10-10s10 4 10 10-4 10-10 10-10-4-10-10z M38 16c0 6 4 10 10 10s10-4 10-10-4-10-10-10-10 4-10 10z" stroke="white" stroke-width="2.5" fill="none"/>
                  <circle cx="20" cy="16" r="2" fill="white"/>
                  <circle cx="54" cy="16" r="2" fill="white"/>
                </svg>
              </div>
              <div class="bg-slate-800 text-slate-100 px-4 py-3 rounded-2xl text-sm shadow-lg border border-slate-700/50 max-w-xs leading-relaxed font-mono">
                <!-- 使用 white-space: pre-line 保持換行格式 -->
                <div class="whitespace-pre-line">{{ msg.content }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 輸入中動畫 -->
        <div v-if="isTyping" class="flex items-center gap-2 text-pink-400 text-sm">
          <div class="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center">
            <div class="w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
          </div>
          <span>InfiMini正在思考中...</span>
        </div>
      </div>
      
      <!-- 🎯 精美輸入區 -->
      <div class="p-3 bg-slate-900 border-t border-white/10 rounded-b-xl">
        <div class="flex gap-2">
          <input 
            v-model="currentMessage" 
            @keyup.enter="sendMessage"
            class="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            placeholder="歡迎光臨INFINITY"
          />
          <button 
            @click="sendMessage" 
            class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            💬
          </button>
        </div>
      </div>
    </div>

    <!-- 🤖 客服機器人浮動按鈕 - 只在對話窗關閉時顯示 -->
    <button
      v-if="!isOpen"
      @mousedown="startDrag"
      class="relative w-16 h-16 bg-gradient-to-br from-pink-500 via-red-500 to-purple-600 text-white rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-2xl overflow-hidden group animate-pulse hover:animate-none"
    >
      <!-- 🌟 背景動態效果 -->
      <div class="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-red-400/30 to-purple-500/30 rounded-full animate-spin-slow"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-45 animate-ping"></div>
      
      <!-- 💫 外圈光暈效果 -->
      <div class="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-75 animate-pulse scale-110 blur-sm"></div>
      
      <!-- 機器人圖案 -->
      <div class="relative z-10 transform transition-transform duration-200 group-hover:scale-110">
        <div class="mb-0.5">
          <svg class="w-8 h-4 animate-bounce" viewBox="0 0 80 32" fill="none">
            <!-- 無限符號路徑 - 加入動畫 -->
            <path 
              d="M16 16c0-6 4-10 10-10s10 4 10 10-4 10-10 10-10-4-10-10z M38 16c0 6 4 10 10 10s10-4 10-10-4-10-10-10-10 4-10 10z" 
              stroke="white" 
              stroke-width="2.5" 
              fill="none"
              class="animate-pulse"
            />
            <!-- 左眼睛 - 閃爍動畫 -->
            <circle cx="30" cy="16" r="3" fill="black" class="animate-ping"/>
            <!-- 右眼睛 - 閃爍動畫 -->
            <circle cx="54" cy="16" r="3" fill="black" class="animate-ping"/>
            <!-- 實心眼睛覆蓋 -->
            <circle cx="30" cy="16" r="2" fill="black"/>
            <circle cx="54" cy="16" r="2" fill="black"/>
          </svg>
        </div>
        <div class="text-xs font-bold leading-none animate-pulse">客服</div>
      </div>
      
      <!-- 🔥 多層訊息氣泡提示 -->
      <div class="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce shadow-lg">
        💬
      </div>
      <div class="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping opacity-75"></div>
      
      <!-- ✨ 星星粒子效果 -->
      <div class="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
      <div class="absolute top-3 right-2 w-1 h-1 bg-pink-300 rounded-full animate-ping delay-300"></div>
      <div class="absolute bottom-2 left-3 w-1 h-1 bg-purple-300 rounded-full animate-ping delay-700"></div>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

// 響應式狀態
const isOpen = ref(false)
const currentMessage = ref('')
const messages = ref([])
const isTyping = ref(false)

// 訊息容器引用
const messageContainer = ref(null)

// 拖拽相關狀態
const position = ref({ x: window.innerWidth - 120, y: window.innerHeight - 120 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, time: 0 })

// 拖拽功能
const startDrag = (e) => {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
    time: Date.now()
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e) => {
  if (isDragging.value) {
    position.value = {
      x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragStart.value.x)),
      y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragStart.value.y))
    }
  }
}

const stopDrag = (e) => {
  if (isDragging.value) {
    const dragDuration = Date.now() - dragStart.value.time
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - (position.value.x + dragStart.value.x), 2) + 
      Math.pow(e.clientY - (position.value.y + dragStart.value.y), 2)
    )
    
    // 如果拖拽時間短且距離小，視為點擊
    if (dragDuration < 200 && dragDistance < 5) {
      setTimeout(() => {
        isOpen.value = !isOpen.value
      }, 50)
    }
  }
  
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 滾動到底部的函數
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 監聽訊息變化，自動滾動到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 監聽打字狀態變化，自動滾動到底部
watch(isTyping, () => {
  scrollToBottom()
})

// 監聽聊天窗口開啟狀態，開啟時滾動到底部
watch(isOpen, (newValue) => {
  if (newValue) {
    scrollToBottom()
  }
})

// 發送訊息功能
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return

  const userMessage = {
    type: 'user',
    content: currentMessage.value.trim(),
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  const messageToSend = currentMessage.value.trim()
  currentMessage.value = ''
  
  // 發送用戶訊息後立即滾動
  await scrollToBottom()
  
  isTyping.value = true
  
  try {
    const response = await fetch('https://localhost:7181/api/ChatBot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageToSend })
    })
    
    if (response.ok) {
      const data = await response.json()
      
      setTimeout(async () => {
        messages.value.push({
          type: 'bot',
          content: data.response || '抱歉，我現在無法回應。',
          timestamp: new Date()
        })
        isTyping.value = false
        // AI 回應後滾動到底部
        await scrollToBottom()
      }, 1000)
    } else {
      throw new Error('Network response was not ok')
    }
  } catch (error) {
    console.error('Error:', error)
    setTimeout(async () => {
      messages.value.push({
        type: 'bot',
        content: '抱歉，連線發生問題，請稍後再試。',
        timestamp: new Date()
      })
      isTyping.value = false
      // 錯誤訊息後滾動到底部
      await scrollToBottom()
    }, 1000)
  }
}

// 清理事件監聽器
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
/* 🎨 自定義滾動條 - 影城紅紫風格 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(71, 85, 105, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ec4899, #8b5cf6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #db2777, #7c3aed);
}

/* 🌟 視窗動畫效果 */
.cinema-window-enter-active,
.cinema-window-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cinema-window-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.cinema-window-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* ✨ 自定義動畫效果 */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 0 40px rgba(139, 92, 246, 0.6);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 應用自定義動畫 */
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

/* 🎯 hover 時的特殊效果 */
.group:hover .animate-sparkle {
  animation-duration: 0.8s;
}
</style>
