<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2";

// 定義圖片路徑
const getImagePath = (filename: string) => `/src/images/${filename}`;

const auth = useAuthStore();
const router = useRouter();

// 遊戲狀態
const lotteryCount = ref(0); // 抽籤次數
const currentLetter = ref(''); // 當前抽到的字母
const isShaking = ref(false); // 機台震動狀態
const eggDropped = ref(false); // 扭蛋已掉落
const eggOpening = ref(false); // 扭蛋開啟中
const selectedEggType = ref<'egg1' | 'egg2'>('egg1'); // 扭蛋類型
const showResult = ref(false); // 顯示結果彈窗
const showActivityInfoModal = ref(false); // 顯示遊戲規則

// 字母集合 - INFINITY
const letters = ref([
  { char: 'I', collected: 0, position: 0 },
  { char: 'N', collected: 0, position: 1 },
  { char: 'F', collected: 0, position: 2 },
  { char: 'I', collected: 0, position: 3 },
  { char: 'N', collected: 0, position: 4 },
  { char: 'I', collected: 0, position: 5 },
  { char: 'T', collected: 0, position: 6 },
  { char: 'Y', collected: 0, position: 7 }
]);

// 結果資料
const resultData = ref({
  letter: '',
  isNew: false,
  totalCollected: 0,
  totalLetters: 0
});

// 計算已收集的字母數量
const collectedCount = computed(() => {
  return letters.value.filter(letter => letter.collected >= 1).length;
});

// 計算總字母數量
const totalLetters = computed(() => {
  return letters.value.length;
});

// 載入抽籤次數
const loadLotteryCount = async () => {
  const memberId = auth.memberId;
  if (!memberId || !auth.isLoggedIn) {
    Swal.fire({
      icon: "error",
      title: "請先登入",
      text: "請重新登入後再試",
      confirmButtonText: "確定",
      confirmButtonColor: "#d33"
    }).then(() => {
      router.push("/login");
    });
    return;
  }

  try {
    const response = await fetch(`https://localhost:7181/api/Draw/member/${memberId}/count`);
    if (response.ok) {
      const data = await response.json();
      lotteryCount.value = data.drawCount;
    } else {
      console.error("獲取抽籤次數失敗:", response.status);
      lotteryCount.value = 0;
    }
  } catch (error) {
    console.error("獲取抽籤次數錯誤:", error);
    lotteryCount.value = 0;
  }
};

// 點擊機台開始遊戲
const clickMachine = () => {
  // 檢查是否可以遊戲
  if (lotteryCount.value <= 0) {
    Swal.fire({
      icon: "warning",
      title: "扭蛋次數不足",
      text: "請消費更多金額來獲得扭蛋代幣",
      confirmButtonText: "確定",
      confirmButtonColor: "#f39c12"
    });
    return;
  }

  // 檢查是否正在進行中
  if (isShaking.value || eggDropped.value) return;

  // 開始震動並執行抽獎
  startGame();
};

// 開始遊戲
const startGame = () => {
  // 隨機選擇扭蛋類型
  selectedEggType.value = Math.random() > 0.5 ? 'egg1' : 'egg2';
  
  // 開始震動
  isShaking.value = true;
  
  // 執行後端抽獎
  performDraw();
  
  // 3秒後掉出扭蛋並停止震動
  setTimeout(() => {
    isShaking.value = false;
    eggDropped.value = true;
  }, 3000);
};

// 執行後端抽獎
const performDraw = async () => {
  const memberId = auth.memberId;
  
  try {
        const response = await fetch(`https://localhost:7181/api/Draw/member/${memberId}/draw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          currentLetter.value = data.drawnLetter;
          lotteryCount.value = data.remainingDraws;
          
      // 更新字母收集狀態
           const letterToCollect = letters.value.find(l => l.char === data.drawnLetter && l.collected < 1);
      const isNewLetter = !!letterToCollect;
           if (letterToCollect) {
             letterToCollect.collected = 1;
           }
          
      // 準備結果資料
      resultData.value = {
        letter: data.drawnLetter,
        isNew: isNewLetter,
        totalCollected: collectedCount.value,
        totalLetters: totalLetters.value
      };
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "抽籤失敗",
            text: errorData.message || "請稍後再試",
            confirmButtonText: "確定",
            confirmButtonColor: "#d33"
          });
        }
      } catch (error) {
        console.error("抽籤錯誤:", error);
        Swal.fire({
          icon: "error",
          title: "抽籤失敗",
          text: "網路錯誤，請稍後再試",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33"
        });
  }
};

// 點擊扭蛋開啟
const clickEgg = () => {
  if (!eggDropped.value || eggOpening.value) return;
  
  eggOpening.value = true;
  
  // 1.5秒後顯示結果
  setTimeout(() => {
    showResult.value = true;
    resetGame();
  }, 1500);
};

// 重置遊戲狀態
const resetGame = () => {
  eggDropped.value = false;
  eggOpening.value = false;
  currentLetter.value = '';
};

// 獲取扭蛋圖片路徑
const getEggImagePath = () => {
  return getImagePath(`${selectedEggType.value}.png`);
};

// 關閉結果彈窗
const closeResult = () => {
  showResult.value = false;
};

// 載入已收集的字母
const loadCollectedLetters = async () => {
  const memberId = auth.memberId;
  if (!memberId) return;

  try {
    const response = await fetch(`https://localhost:7181/api/Draw/member/${memberId}/collected`);
    if (response.ok) {
      const data = await response.json();
      
      // 更新字母收集狀態
      const letterPositions = {
        'I': [0, 3, 5], // I 字母在位置 0, 3, 5
        'N': [1, 4],    // N 字母在位置 1, 4
        'F': [2],       // F 字母在位置 2
        'T': [6],       // T 字母在位置 6
        'Y': [7]        // Y 字母在位置 7
      };
      
      // 重置所有字母的收集狀態
      letters.value.forEach(letter => {
        letter.collected = 0;
      });
      
      // 根據後端返回的收集數據分配字母
      data.collectedLetters.forEach((collectedLetter: any) => {
        const positions = letterPositions[collectedLetter.letter as keyof typeof letterPositions];
        if (positions) {
          // 為每個收集到的字母分配位置
          for (let i = 0; i < collectedLetter.count && i < positions.length; i++) {
            const position = positions[i];
            if (letters.value[position]) {
              letters.value[position].collected = 1;
            }
          }
        }
      });
    } else {
      console.error("獲取已收集字母失敗:", response.status);
    }
  } catch (error) {
    console.error("獲取已收集字母錯誤:", error);
  }
};

// 重置遊戲功能
const resetGameProgress = async () => {
  const result = await Swal.fire({
    title: "確定要重置遊戲？",
    text: "所有收集的字母將會清空",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "確定重置",
    cancelButtonText: "取消"
  });

  if (result.isConfirmed) {
    const memberId = auth.memberId;
    
    try {
      const response = await fetch(`https://localhost:7181/api/Draw/member/${memberId}/reset`, {
        method: 'DELETE'
      });

                     if (response.ok) {
          const data = await response.json();
        
        // 清空本地字母收集狀態
          letters.value.forEach(letter => {
            letter.collected = 0;
          });
          
        // 重新載入抽籤次數
        await loadLotteryCount();
        await loadCollectedLetters();
          
          Swal.fire({
            icon: "success",
          title: "🎉 遊戲已完全重置",
          html: `
            <div style="text-align: center; padding: 10px;">
              <p style="margin: 10px 0;">✅ 已清空 ${data.deletedCount || 0} 個抽籤記錄</p>
              <p style="margin: 10px 0;">✅ 字母收集進度已重置</p>
              <p style="margin: 10px 0; color: #00ff88; font-weight: bold;">🎲 抽籤次數已恢復至 ${lotteryCount.value} 次</p>
            </div>
          `,
          confirmButtonText: "開始新遊戲",
            confirmButtonColor: "#3085d6"
          });
        } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "重置失敗",
          text: errorData.message || "請稍後再試",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33"
        });
      }
    } catch (error) {
      console.error("重置錯誤:", error);
      Swal.fire({
        icon: "error",
        title: "重置失敗",
        text: "網路錯誤，請稍後再試",
        confirmButtonText: "確定",
        confirmButtonColor: "#d33"
      });
    }
  }
};

// 返回會員資料頁面
const goBack = () => {
  router.push("/memberInform");
};

// 顯示遊戲規則介紹
const showActivityInfo = () => {
  showActivityInfoModal.value = true;
};

// 關閉遊戲規則介紹
const closeActivityInfo = () => {
  showActivityInfoModal.value = false;
};

onMounted(() => {
  loadLotteryCount();
  loadCollectedLetters();
});
</script>

<template>
  <div class="lottery-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">INFINITY DRAW</h1>
      <p class="page-subtitle">收集 INFINITY 字母，無限看電影！</p>
    </div>

    <!-- 遊戲資訊 -->
    <div class="game-info">
      <div class="info-card">
        <div class="info-item">
            <span class="info-label">扭蛋代幣：</span>
            <span class="info-value">🪙 {{ lotteryCount }}顆</span>
        </div>
        <div class="info-item">
          <button @click.stop="showActivityInfo" class="activity-info-btn">
            ℹ️ 遊戲規則介紹
          </button>
        </div>
      </div>
    </div>

    <!-- 扭蛋機遊戲區域 -->
    <div class="game-section">
      <div class="game-container">
        <!-- 硬幣數量顯示 -->

        <!-- 扭蛋機本體 -->
        <div class="machine-container" :class="{ 'shaking': isShaking }" @click.stop="() => {}">
          <img 
            :src="getImagePath('扭蛋機.png')" 
            alt="扭蛋機" 
            class="machine-image"
            @click.stop="clickMachine"
            :style="{ 
              cursor: (lotteryCount <= 0 || isShaking || eggDropped) ? 'not-allowed' : 'pointer'
            }"
          />
        </div>
        
        <!-- 掉落的扭蛋 -->
        <div class="egg-area">
          <img 
            v-if="eggDropped" 
            :src="getEggImagePath()"
            alt="扭蛋"
            class="dropped-egg"
            :class="{ 'opening': eggOpening }"
            @click.stop="clickEgg"
          />
          
          <!-- 扭蛋開啟時顯示字母 -->
          <div 
            v-if="eggOpening && currentLetter" 
            class="letter-reveal"
          >
            {{ currentLetter }}
      </div>
        </div>

        <!-- 遊戲狀態提示 -->
        <div class="game-status">
          <div v-if="!isShaking && !eggDropped && lotteryCount > 0" class="status-ready">
            點擊扭蛋機開始遊戲！
          </div>
          <div v-else-if="isShaking" class="status-shaking">
            扭蛋機運轉中...
          </div>
          <div v-else-if="eggDropped && !eggOpening" class="status-dropped">
            點擊扭蛋查看結果！
          </div>
          <div v-else-if="eggOpening" class="status-opening">
            扭蛋開啟中...
          </div>
          <div v-else-if="lotteryCount === 0" class="status-empty">
            沒有代幣了，請先消費獲得抽獎代幣！
          </div>
        </div>
      </div>
    </div>

    <!-- 遊戲控制按鈕 -->
    <div class="game-controls">
      <button @click.stop="resetGameProgress" class="reset-btn">
        🔄 重置遊戲
      </button>
      <button @click.stop="goBack" class="back-btn">
        ← 返回會員資料
      </button>
    </div>

    <!-- 字母收集展示 -->
    <div class="collection-section">
      <h2 class="section-title">📝 字母收集</h2>
      
             <div class="letters-row">
                   <div 
            v-for="(letter, index) in letters" 
            :key="index"
            class="letter-card"
            :class="{ 'collected': letter.collected >= 1 }"
          >
            <span class="letter">{{ letter.char }}</span>
          </div>
       </div>
      
      <!-- 完成提示 -->
      <div v-if="collectedCount === totalLetters" class="completion-message">
        🎉 恭喜！您已收集完所有字母！
      </div>
    </div>

    <!-- 抽籤結果彈出層 -->
    <div v-if="showResult" class="result-overlay" @click="closeResult">
      <div class="result-modal" @click.stop>
        <div class="result-content">
          <div class="result-header">
            <h2 class="result-title">🎉 抽籤結果</h2>
          </div>
          
          <div class="result-letter-container">
            <div class="result-letter" :class="{ 'new-letter': resultData.isNew, 'duplicate-letter': !resultData.isNew }">
              {{ resultData.letter }}
            </div>
            <div class="letter-status">
              <span v-if="resultData.isNew" class="status-new">✨ 新字母！</span>
              <span v-else class="status-duplicate">📝 重複字母</span>
            </div>
          </div>
          
          <div class="result-progress">
            <div class="progress-text">
              收集進度：{{ resultData.totalCollected }} / {{ resultData.totalLetters }}
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (resultData.totalCollected / resultData.totalLetters * 100) + '%' }"
              ></div>
            </div>
            <div class="progress-percentage">
              {{ Math.round(resultData.totalCollected / resultData.totalLetters * 100) }}%
            </div>
          </div>
          
          <div v-if="resultData.totalCollected === resultData.totalLetters" class="completion-celebration">
            🎊 恭喜完成收集！您獲得了終生免費觀影特權！ 🎊
          </div>
          
          <button @click="closeResult" class="result-close-btn">
            繼續遊戲
      </button>
        </div>
      </div>
    </div>

    <!-- 遊戲規則介紹彈出層 -->
    <div v-if="showActivityInfoModal" class="activity-info-overlay" @click="closeActivityInfo">
      <div class="activity-info-modal" @click.stop>
        <div class="activity-info-content">
          <div class="activity-info-header">
            <h2 class="activity-info-title">🎮 INFINITY DRAW 遊戲規則</h2>
            <button @click="closeActivityInfo" class="close-btn">✕</button>
          </div>
          
          <div class="activity-info-body">
            <div class="rule-section">
              <h3>🎯 遊戲目標</h3>
              <p>收集完整的 <strong>INFINITY</strong> 字樣，解鎖終生免費觀影特權！</p>
            </div>
            
            <div class="rule-section">
              <h3>🎰 如何遊戲</h3>
              <ol>
                <li>消費購買電影票或商品來獲得抽籤次數（硬幣）</li>
                <li>點擊扭蛋機本體開始遊戲</li>
                <li>機台會震動 3 秒鐘</li>
                <li>隨機掉出 egg1 或 egg2 扭蛋</li>
                <li>點擊扭蛋查看獲得的字母</li>
              </ol>
            </div>
            
            <div class="rule-section">
              <h3>📝 字母收集</h3>
              <p>需要收集的字母：<strong>I-N-F-I-N-I-T-Y</strong></p>
              <p>• 每個位置的字母都需要收集到</p>
              <p>• 重複字母不會增加進度</p>
              <p>• 完成收集後獲得特殊獎勵</p>
            </div>
            
            <div class="rule-section">
              <h3>🎁 獎勵說明</h3>
              <p>完成所有字母收集後，您將獲得：</p>
              <ul>
                <li>🎬 終生免費觀影特權</li>
                <li>🏆 專屬會員徽章</li>
                <li>⭐ VIP 會員權益</li>
              </ul>
            </div>
            
            <div class="rule-section">
              <h3>💡 注意事項</h3>
              <p>• 本公司保留隨時修改、變更、暫停或終止本活動內容之權利</p>
            </div>
          </div>
          
          <div class="activity-info-footer">
            <button @click="closeActivityInfo" class="activity-info-close-btn">
              開始遊戲 🎮
      </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.lottery-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 100px 5% 60px; /* 縮小上下內邊距 */
  color: white;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem; /* 縮小標題與內容的間距 */
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  animation: gradient 8s linear infinite;
  background-size: 300%;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  opacity: 0.8;
}

/* 遊戲資訊樣式 */
.game-info {
  margin-bottom: 1rem; /* 縮小間距 */
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  max-width: 600px;
  margin: 0 auto;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  color: #cccccc;
  pointer-events: none; /* 防止點擊觸發事件 */
  user-select: none; /* 防止文字選取 */
}

.info-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f9f906;
  pointer-events: none; /* 防止點擊觸發事件 */
  user-select: none; /* 防止文字選取 */
}

/* 遊戲區域樣式 */
.game-section {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
  pointer-events: none; /* 防止區域觸發事件 */
}

.game-container {
  position: relative;
  width: 400px;
  height: 600px; /* 增加容器高度以容納下移的扭蛋機 */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none; /* 防止容器觸發事件 */
}

/* 扭蛋機本體 */
.machine-container {
  position: relative;
  width: 100%;
  height: 500px; /* 調整高度以配合新的尺寸 */
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(50px); /* 往下移動50px，避免遮擋上方內容 */
  pointer-events: none; /* 防止容器本身觸發點擊 */
}

.machine-image {
  width: 80%; /* 縮小30% (300% -> 210%) */
  height: auto;
  object-fit: contain;
  transition: transform 0.1s ease;
  user-select: none;
  pointer-events: auto; /* 確保圖片可以點擊 */
}

.machine-container.shaking .machine-image {
  animation: machineShake 0.2s ease-in-out infinite;
}

/* 硬幣顯示 */


.coin-icon {
  font-size: 1.5rem;
  animation: coinGlint 2s ease-in-out infinite;
}

.coin-count {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* 扭蛋區域 */
.egg-area {
  position: absolute;
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 100px; /* 調整位置以配合下移的扭蛋機 */
  left: 0;
  pointer-events: none; /* 區域本身不可點擊 */
}

.dropped-egg {
  width: 120px; /* 扭蛋也稍微放大配合扭蛋機 */
  height: auto;
  cursor: pointer;
  animation: eggAppear 1s ease-out; /* 改為由遠到近的出現動畫 */
  transition: transform 0.3s ease;
  z-index: 10; /* 確保扭蛋在文字上方 */
  position: relative;
  pointer-events: auto; /* 確保扭蛋可以點擊 */
}

.dropped-egg:hover {
  transform: scale(1.1);
}

.dropped-egg.opening {
  animation: eggOpen 1.5s ease-out;
}

/* 字母顯示 */
.letter-reveal {
  position: absolute;
  font-size: 3rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: letterGradualAppear 2s ease-out;
  pointer-events: none;
  z-index: 20;
}

/* 遊戲狀態提示 */
.game-status {
  position: absolute;
  bottom: 0; /* 定位在容器底部 */
  width: 100%;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  z-index: 5;
}

.status-ready {
  color: #00ff88;
  animation: pulse 2s infinite;
}

.status-shaking {
  color: #ffd700;
  animation: pulse 1s infinite;
}

.status-dropped {
  color: #ff6b6b;
  animation: pulse 1.5s infinite;
}

.status-opening {
  color: #4834d4;
}

.status-empty {
  color: #ff6b6b;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem; /* 縮小標題下方間距 */
  text-align: center;
}

/* 字母收集展示樣式 */
.collection-section {
  margin-bottom: 2rem; /* 縮小底部間距 */
}

.letters-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.letter-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 80px;
}

.letter-card.collected {
  background: linear-gradient(45deg, #fbff00, #00cc6a);
  border-color: #acf503;
  transform: scale(1.05);
}

.letter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.letter {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.letter-card.collected .letter {
  color: #1a1a1a;
}

.completion-message {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #00ff88;
  animation: glow 2s ease-in-out infinite alternate;
}

/* 遊戲控制按鈕區域 */
.game-controls {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0; /* 縮小上下間距 */
}

/* 操作按鈕樣式 */
.reset-btn, .back-btn, .activity-info-btn {
  background: linear-gradient(45deg, #4834d4, #686de0);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto; /* 確保按鈕可以點擊 */
}

.reset-btn {
  background: linear-gradient(45deg, #f39c12, #e67e22);
}

.activity-info-btn {
  background: linear-gradient(45deg, #00a8ff, #0078ff);
}

.reset-btn:hover, .back-btn:hover, .activity-info-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 結果彈出層 */
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.result-modal {
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.4s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.result-content {
  position: relative;
  padding: 3rem 2rem 2rem;
  text-align: center;
  color: white;
}

.result-header {
  margin-bottom: 2rem;
}

.result-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.result-letter-container {
  margin-bottom: 2rem;
}

.result-letter {
  font-size: 5rem;
  font-weight: 900;
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: letterPop 0.6s ease-out;
  border: 4px solid;
}

.result-letter.new-letter {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border-color: #00ff88;
  color: #1a1a1a;
  animation: letterPop 0.6s ease-out, glowPulse 2s ease-in-out infinite;
}

.result-letter.duplicate-letter {
  background: linear-gradient(135deg, #666, #888);
  border-color: #666;
  color: white;
}

.letter-status {
  font-size: 1.2rem;
  font-weight: 600;
}

.status-new {
  color: #00ff88;
  animation: textGlow 1.5s ease-in-out infinite;
}

.status-duplicate {
  color: #cccccc;
}

.result-progress {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-text {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: white;
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff3366, #ffd700, #00ff88);
  border-radius: 6px;
  transition: width 0.8s ease-out;
  animation: progressShine 2s ease-in-out infinite;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
}

.completion-celebration {
  background: linear-gradient(135deg, #ffd700, #ff6b6b);
  color: #1a1a1a;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  animation: celebration 0.8s ease-out;
}

.result-close-btn {
  background: linear-gradient(45deg, #ff3366, #ff6b6b);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.result-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
}

/* 遊戲規則介紹彈出層 */
.activity-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.activity-info-modal {
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.4s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.activity-info-content {
  position: relative;
  color: white;
}

.activity-info-header {
  position: relative;
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-info-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #00a8ff, #0078ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.activity-info-body {
  padding: 1.5rem 2rem;
  max-height: 50vh;
  overflow-y: auto;
}

.rule-section {
  margin-bottom: 2rem;
}

.rule-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #00a8ff;
  margin-bottom: 0.8rem;
}

.rule-section p {
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.rule-section ol {
  color: #cccccc;
  line-height: 1.6;
  padding-left: 1.5rem;
}

.rule-section ul {
  color: #cccccc;
  line-height: 1.6;
  padding-left: 1.5rem;
}

.rule-section li {
  margin-bottom: 0.3rem;
}

.rule-section strong {
  color: #ffd700;
}

.activity-info-footer {
  padding: 1.5rem 2rem 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-info-close-btn {
  background: linear-gradient(45deg, #00a8ff, #0078ff);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.activity-info-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 168, 255, 0.4);
}

/* 動畫定義 */
@keyframes machineShake {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(-3px) translateY(-2px);
  }
  50% {
    transform: translateX(3px) translateY(2px);
  }
  75% {
    transform: translateX(-2px) translateY(-3px);
  }
}

@keyframes coinGlint {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
}

@keyframes eggAppear {
  0% {
    transform: scale(0.2);
    opacity: 0;
    filter: blur(8px);
  }
  30% {
    transform: scale(0.4);
    opacity: 0.3;
    filter: blur(4px);
  }
  60% {
    transform: scale(0.8);
    opacity: 0.7;
    filter: blur(2px);
  }
  80% {
    transform: scale(1.1);
    opacity: 0.9;
    filter: blur(0px);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: blur(0px);
  }
}

@keyframes eggOpen {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  75% {
    transform: scale(1.1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes letterGradualAppear {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
    filter: blur(10px);
  }
  30% {
    opacity: 0.3;
    transform: scale(0.6) translateY(10px);
    filter: blur(5px);
  }
  60% {
    opacity: 0.7;
    transform: scale(0.9) translateY(5px);
    filter: blur(2px);
  }
  80% {
    opacity: 0.9;
    transform: scale(1.1) translateY(-2px);
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  to {
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes letterPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 255, 136, 0.8);
  }
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
  }
}

@keyframes progressShine {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes celebration {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .lottery-container {
    padding: 80px 3% 40px; /* 手機版進一步縮小內邊距 */
  }

  .page-title {
    font-size: 2rem;
  }

  .page-header {
    margin-bottom: 1.5rem; /* 手機版縮小標題間距 */
  }

  .game-info {
    margin-bottom: 0.5rem; /* 手機版縮小遊戲資訊間距 */
  }

  .info-card {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem; /* 縮小卡片內邊距 */
  }

  .game-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: 0.5rem 0; /* 手機版縮小按鈕區域間距 */
  }

  .reset-btn, .back-btn, .activity-info-btn {
    width: 200px;
  }

  .game-container {
    width: 300px;
    height: 450px; /* 手機版增加容器高度 */
  }

  .machine-container {
    height: 350px; /* 手機版調整扭蛋機容器高度 */
    transform: translateY(20px); /* 手機版扭蛋機稍微下移 */
  }

  .machine-image {
    width: 175%; /* 手機版縮小30% (250% -> 175%) */
    max-height: 175%;
  }

  .egg-area {
    bottom: 60px; /* 手機版調整扭蛋位置 */
  }

  .dropped-egg {
    width: 90px; /* 手機版扭蛋稍微放大 */
  }

  .letter-reveal {
    font-size: 2.5rem;
  }

  .game-status {
    font-size: 1rem;
  }

  .letters-row {
    justify-content: center;
  }

  .result-modal {
    width: 95%;
    margin: 0 2.5%;
  }

  .result-content {
    padding: 2rem 1.5rem 1.5rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .result-letter {
    font-size: 4rem;
    width: 100px;
    height: 100px;
  }
}
</style>