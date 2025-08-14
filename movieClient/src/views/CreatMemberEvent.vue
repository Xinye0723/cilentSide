<template>
  <div class="create-event">
    <h1>建立揪團活動</h1>
    <form @submit.prevent="submitForm">
      <label>活動標題：</label>
      <input v-model="title" type="text" required />

      <label>選擇電影：</label>
      <div class="movie-selection">
        <div class="movie-search-container">
          <div class="search-icon">
            <i class="bi bi-search"></i>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋電影名稱、導演或標籤..."
            @input="filterMovies"
            class="movie-search-input"
          />
          <div class="search-clear" v-if="searchQuery" @click="clearSearch">
            <i class="bi bi-x-circle"></i>
          </div>
        </div>

        <div class="movie-grid-container">
          <div class="movie-grid-header">
            <span class="movie-count">{{ filteredMovies.length }} 部電影</span>
          </div>

          <div class="movie-list">
            <div
              v-for="movie in filteredMovies"
              :key="movie.movieId"
              class="movie-item"
              :class="{ selected: selectedMovie?.movieId === movie.movieId }"
              @click="selectMovie(movie)"
              @mouseenter="showTooltip($event, movie)"
              @mouseleave="hideTooltip"
              :data-movie-id="movie.movieId"
            >
              <div class="movie-item-content">
                <div class="movie-text-info">
                  <div class="movie-title-row">
                    <h3 class="movie-title">{{ movie.movieNameChinese }}</h3>
                    <span class="movie-duration">{{ movie.duration }}分鐘</span>
                  </div>
                  <p class="movie-english">{{ movie.movieNameEnglish }}</p>
                  <div class="movie-meta">
                    <span class="director">
                      <i class="bi bi-person"></i>
                      {{ movie.director }}
                    </span>
                    <div class="movie-tags">
                      <span v-for="tag in movie.tags" :key="tag" class="tag">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="select-indicator">
                  <i
                    class="bi bi-check-circle"
                    v-if="selectedMovie?.movieId !== movie.movieId"
                  ></i>
                  <i class="bi bi-check-circle-fill" v-else></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 懸停提示框 -->
        <div v-if="tooltip.show" class="movie-tooltip">
          <div class="tooltip-poster">
            <img
              :src="getMoviePosterUrl(tooltip.movie?.posterPicture)"
              :alt="tooltip.movie?.movieNameChinese"
              @error="handleTooltipImageError"
              @load="handleTooltipImageLoad"
              loading="lazy"
            />
            <div class="tooltip-poster-placeholder" v-if="!tooltipImageLoaded">
              <span>{{ tooltip.movie?.movieNameChinese }}</span>
            </div>
          </div>
          <div class="tooltip-content">
            <h4>{{ tooltip.movie?.movieNameChinese }}</h4>
            <p class="tooltip-english">{{ tooltip.movie?.movieNameEnglish }}</p>
            <div class="tooltip-meta">
              <span class="tooltip-duration"
                >{{ tooltip.movie?.duration }}分鐘</span
              >
            </div>
            <div class="tooltip-tags">
              <span
                v-for="tag in tooltip.movie?.tags"
                :key="tag"
                class="tooltip-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedMovie" class="selected-movie-info">
          <div class="selected-header">
            <i class="bi bi-check-circle-fill"></i>
            <h4>已選擇電影</h4>
          </div>
          <div class="selected-content">
            <h5>{{ selectedMovie.movieNameChinese }}</h5>
            <p class="selected-plot">{{ selectedMovie.plot }}</p>
            <div class="selected-meta">
              <span class="selected-duration"
                >{{ selectedMovie.duration }}分鐘</span
              >
              <span class="selected-director">{{
                selectedMovie.director
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="time-capacity-row">
        <div class="time-section">
          <label>開始時間：</label>
          <div class="time-input-container">
            <input
              ref="startTimeInput"
              v-model="startTime"
              type="datetime-local"
              required
              @change="validateTime"
            />
            <div class="infinity-emoji" @click="focusDateTimeInput">∞</div>
          </div>
          <div v-if="timeError" class="error-message">
            <i class="bi bi-exclamation-triangle"></i>
            {{ timeError }}
          </div>
        </div>

        <div class="capacity-section">
          <label>容納人數：</label>
          <div class="capacity-control">
            <button type="button" @click="decreaseCapacity">-</button>
            <input
              v-model.number="maxCapacity"
              type="number"
              min="1"
              max="100"
              class="capacity-input"
              @input="validateCapacity"
            />
            <button type="button" @click="increaseCapacity">+</button>
          </div>
          <div v-if="capacityError" class="error-message">
            <i class="bi bi-exclamation-triangle"></i>
            {{ capacityError }}
          </div>
        </div>
      </div>

      <label>活動說明：</label>
      <div class="description-container">
        <textarea
          v-model="description"
          rows="4"
          placeholder="請輸入活動說明..."
          class="description-textarea"
          @input="updateCharCount"
        ></textarea>
        <div v-if="descriptionError" class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          {{ descriptionError }}
        </div>
      </div>

      <div class="btn-row">
        <button class="back-btn" @click="goBack">返回上一頁</button>
        <button
          class="submit-btn"
          :disabled="!canSubmit || isSubmitting"
          @click="validateAndSubmit"
        >
          {{ isSubmitting ? "建立中..." : submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();
const router = useRouter();

function goBack() {
  router.back();
}

const title = ref("");
const selectedMovie = ref(null);
const startTime = ref("");
const maxCapacity = ref(30);
const description = ref("");
const searchQuery = ref("");
const movies = ref([]);
const filteredMovies = ref([]);
const imageLoaded = reactive({});

// ✅ 添加防重複提交的標記
const isSubmitting = ref(false);

// 處理圖片URL
const getMoviePosterUrl = (posterPath) => {
  if (!posterPath) {
    return "/default-movie-poster.jpg";
  }

  if (posterPath.startsWith("http")) {
    return posterPath;
  }

  return `https://localhost:7181/${posterPath}`;
};

// 載入電影資料
const loadMovies = async () => {
  try {
    const res = await fetch("https://localhost:7181/api/Movies");
    if (res.ok) {
      const data = await res.json();
      movies.value = data.filter((movie) => movie.movieStatusId === 2);
      filteredMovies.value = movies.value;
    }
  } catch (error) {
    console.error("載入電影失敗:", error);
  }
};

// 搜尋電影
const filterMovies = () => {
  if (!searchQuery.value.trim()) {
    filteredMovies.value = movies.value;
    return;
  }

  const query = searchQuery.value.toLowerCase().trim();
  filteredMovies.value = movies.value.filter((movie) => {
    if (
      movie.movieNameChinese &&
      movie.movieNameChinese.toLowerCase().includes(query)
    ) {
      return true;
    }

    if (
      movie.movieNameEnglish &&
      movie.movieNameEnglish.toLowerCase().includes(query)
    ) {
      return true;
    }

    if (movie.director && movie.director.toLowerCase().includes(query)) {
      return true;
    }

    if (movie.tags && Array.isArray(movie.tags)) {
      return movie.tags.some((tag) => tag.toLowerCase().includes(query));
    }

    return false;
  });
};

// 清除搜尋
const clearSearch = () => {
  searchQuery.value = "";
  filteredMovies.value = movies.value;
};

// 選擇電影
const selectMovie = (movie) => {
  selectedMovie.value = movie;
};

// 處理圖片載入錯誤
const handleImageError = (event) => {
  console.log("圖片載入失敗:", event.target.src);
  event.target.style.display = "none";
};

// 處理圖片載入成功
const handleImageLoad = (event) => {
  // 圖片載入成功處理
};

const increaseCapacity = () => {
  maxCapacity.value++;
};

const decreaseCapacity = () => {
  if (maxCapacity.value > 1) maxCapacity.value--;
};

// 驗證相關變數
const timeError = ref("");
const capacityError = ref("");
const descriptionError = ref("");

// 驗證時間
const validateTime = () => {
  timeError.value = "";

  if (!startTime.value) {
    timeError.value = "請選擇開始時間";
    return false;
  }

  const selectedTime = new Date(startTime.value);
  const now = new Date();

  if (selectedTime <= now) {
    timeError.value = "開始時間不能是過去或現在的時間";
    return false;
  }

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  if (selectedTime > oneYearLater) {
    timeError.value = "開始時間不能超過一年後";
    return false;
  }

  return true;
};

// 驗證人數
const validateCapacity = () => {
  capacityError.value = "";

  if (!maxCapacity.value || maxCapacity.value < 2) {
    capacityError.value = "容納人數至少需要2人";
    return false;
  }

  if (maxCapacity.value > 80) {
    capacityError.value = "容納人數不能超過80人";
    return false;
  }

  return true;
};

// 驗證說明
const validateDescription = () => {
  descriptionError.value = "";

  if (!description.value.trim()) {
    descriptionError.value = "請輸入活動說明";
    return false;
  }

  return true;
};

// 計算是否可以提交
const canSubmit = computed(() => {
  // 基本檢查：必須有標題、選擇電影、開始時間、說明
  const hasBasicInfo =
    title.value.trim() &&
    selectedMovie.value &&
    startTime.value &&
    description.value.trim();

  // 檢查是否有錯誤訊息
  const hasNoErrors =
    !timeError.value && !capacityError.value && !descriptionError.value;

  // 檢查人數是否在合理範圍內
  const validCapacity = maxCapacity.value >= 2 && maxCapacity.value <= 100;

  return hasBasicInfo && hasNoErrors && validCapacity;
});

// 提交按鈕文字
const submitButtonText = computed(() => {
  if (!title.value.trim()) return "請輸入活動標題";
  if (!selectedMovie.value) return "請選擇電影";
  if (!startTime.value) return "請選擇開始時間";
  if (!description.value.trim()) return "請輸入活動說明";
  if (timeError.value) return "請修正時間";
  if (capacityError.value) return "請修正人數";
  if (descriptionError.value) return "請修正說明";
  return "送出活動";
});

// 驗證並提交
const validateAndSubmit = async () => {
  const isTimeValid = validateTime();
  const isCapacityValid = validateCapacity();
  const isDescriptionValid = validateDescription();

  if (!isTimeValid || !isCapacityValid || !isDescriptionValid) {
    return;
  }

  if (!selectedMovie.value) {
    alert("請選擇電影");
    return;
  }

  // ✅ 直接在這裡處理提交邏輯
  await submitForm();
};

const submitForm = async () => {
  // ✅ 添加防重複提交的標記
  if (isSubmitting.value) {
    console.log("正在提交中，請稍候...");
    return;
  }

  if (!selectedMovie.value) {
    alert("請選擇電影");
    return;
  }

  try {
    isSubmitting.value = true; // 設置提交中標記

    const start = new Date(startTime.value);
    const end = new Date(start);
    end.setHours(start.getHours() + 2);

    const currentMemberId = auth.memberId;

    const newEvent = {
      title: title.value,
      movieId: selectedMovie.value.movieId,
      theaterNumber: 1,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      showTimeId: 1,
      price: 300,
      description: description.value,
      maxCapacity: maxCapacity.value,
      organizerId: Number(currentMemberId),
    };

    console.log("開始提交活動:", newEvent);

    const res = await fetch("https://localhost:7181/api/MemberEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });

    if (res.ok) {
      const result = await res.json();
      console.log("活動建立成功:", result);
      showSuccessToast("您的活動已成功建立！");

      // 提示函數會自動處理跳轉，不需要手動跳轉
    } else {
      const errorData = await res.json();
      console.error("建立失敗:", errorData);
      showErrorToast("建立失敗: " + (errorData.error || "未知錯誤"));
    }
  } catch (err) {
    console.error("提交錯誤：", err);
    showErrorToast("建立失敗，請稍後再試");
  } finally {
    isSubmitting.value = false; // 重置提交中標記
  }
};

// 提示框相關
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  movie: null,
});

const tooltipImageLoaded = ref(false);

// 美觀的成功提示函數 - 升級版 (淡藍色主題)
const showSuccessToast = (message) => {
  // 移除現有的提示
  const existingToasts = document.querySelectorAll(".event-success-toast");
  existingToasts.forEach((toast) => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  });

  const toast = document.createElement("div");
  toast.className = "event-success-toast";

  // 設置樣式 - 升級版 (淡藍色主題)
  toast.style.position = "fixed";
  toast.style.top = "50%";
  toast.style.left = "50%";
  toast.style.transform = "translate(-50%, -50%)";
  toast.style.padding = "2.5rem";
  toast.style.borderRadius = "25px";
  toast.style.zIndex = "99999";
  toast.style.fontSize = "1.1rem";
  toast.style.boxShadow =
    "0 25px 80px rgba(100, 181, 246, 0.4), 0 10px 40px rgba(0, 0, 0, 0.2)";
  toast.style.backdropFilter = "blur(25px)";
  toast.style.maxWidth = "450px";
  toast.style.fontWeight = "600";
  toast.style.transition = "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
  toast.style.display = "flex";
  toast.style.flexDirection = "column";
  toast.style.alignItems = "center";
  toast.style.gap = "1.2rem";
  toast.style.textAlign = "center";
  toast.style.border = "2px solid rgba(255, 255, 255, 0.3)";
  toast.style.background =
    "linear-gradient(135deg, rgba(100, 181, 246, 0.95) 0%, rgba(144, 202, 249, 0.95) 50%, rgba(100, 181, 246, 0.95) 100%)";
  toast.style.color = "#fff";
  toast.style.overflow = "hidden";

  // 添加背景裝飾元素
  toast.innerHTML = `
    <div style="
      position: absolute;
      top: -50px;
      right: -50px;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 3s ease-in-out infinite;
    "></div>
    <div style="
      position: absolute;
      bottom: -30px;
      left: -30px;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      animation: float 3s ease-in-out infinite reverse;
    "></div>
    
    <div style="
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      animation: bounceIn 0.8s ease-out, pulse 2s ease-in-out infinite 1s;
      border: 3px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      color: #1976d2;
      font-weight: bold;
    ">∞</div>
    
    <div style="
      font-size: 1.4rem; 
      font-weight: 700; 
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: linear-gradient(45deg, #fff, #e3f2fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    ">活動建立成功！</div>
    
    <div style="
      font-size: 1.05rem; 
      opacity: 0.95; 
      line-height: 1.5;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    ">${message}</div>
    
    <div style="
      margin-top: 1.5rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.3) 0%, rgba(66, 165, 245, 0.3) 100%);
      border-radius: 30px;
      font-size: 0.95rem;
      border: 2px solid rgba(25, 118, 210, 0.5);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(25, 118, 210, 0.2);
      animation: slideInUp 0.6s ease-out 0.3s both;
      color: #1565c0;
      font-weight: 600;
    ">即將跳轉到活動頁面...</div>
    
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2);
      animation: progress 3s linear;
    "></div>
  `;

  // 初始狀態
  toast.style.transform = "translate(-50%, -50%) scale(0.3) rotate(-10deg)";
  toast.style.opacity = "0";

  // 添加升級版動畫樣式
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounceIn {
      0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      50% { transform: scale(1.1) rotate(5deg); }
      70% { transform: scale(0.9) rotate(-2deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    @keyframes fadeInUp {
      0% { transform: translate(-50%, -50%) translateY(40px) scale(0.8); opacity: 0; }
      100% { transform: translate(-50%, -50%) translateY(0) scale(1); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    @keyframes slideInUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // 顯示動畫
  setTimeout(() => {
    toast.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
    toast.style.opacity = "1";
  }, 10);

  // 3秒後自動隱藏並跳轉
  setTimeout(() => {
    toast.style.transform = "translate(-50%, -50%) scale(0.7) rotate(5deg)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
      // 跳轉到活動頁面
      window.location.href = "/memberEvent";
    }, 400);
  }, 3000);
};

// 美觀的錯誤提示函數 - 升級版
const showErrorToast = (message) => {
  // 移除現有的提示
  const existingToasts = document.querySelectorAll(".event-error-toast");
  existingToasts.forEach((toast) => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  });

  const toast = document.createElement("div");
  toast.className = "event-error-toast";

  // 設置樣式 - 升級版
  toast.style.position = "fixed";
  toast.style.top = "50%";
  toast.style.left = "50%";
  toast.style.transform = "translate(-50%, -50%)";
  toast.style.padding = "2.5rem";
  toast.style.borderRadius = "25px";
  toast.style.zIndex = "99999";
  toast.style.fontSize = "1.1rem";
  toast.style.boxShadow =
    "0 25px 80px rgba(255, 107, 107, 0.4), 0 10px 40px rgba(0, 0, 0, 0.2)";
  toast.style.backdropFilter = "blur(25px)";
  toast.style.maxWidth = "450px";
  toast.style.fontWeight = "600";
  toast.style.transition = "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
  toast.style.display = "flex";
  toast.style.flexDirection = "column";
  toast.style.alignItems = "center";
  toast.style.gap = "1.2rem";
  toast.style.textAlign = "center";
  toast.style.border = "2px solid rgba(255, 255, 255, 0.3)";
  toast.style.background =
    "linear-gradient(135deg, rgba(255, 107, 107, 0.95) 0%, rgba(255, 138, 138, 0.95) 50%, rgba(255, 107, 107, 0.95) 100%)";
  toast.style.color = "#fff";
  toast.style.overflow = "hidden";

  // 添加背景裝飾元素
  toast.innerHTML = `
    <div style="
      position: absolute;
      top: -40px;
      left: -40px;
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: floatError 2s ease-in-out infinite;
    "></div>
    <div style="
      position: absolute;
      bottom: -25px;
      right: -25px;
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      animation: floatError 2s ease-in-out infinite reverse;
    "></div>
    
    <div style="
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      animation: shake 0.8s ease-in-out, pulseError 2s ease-in-out infinite 1s;
      border: 3px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    ">❌</div>
    
    <div style="
      font-size: 1.4rem; 
      font-weight: 700; 
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: linear-gradient(45deg, #fff, #ffeaea);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    ">建立失敗</div>
    
    <div style="
      font-size: 1.05rem; 
      opacity: 0.95; 
      line-height: 1.5;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    ">${message}</div>
    
    <div style="
      margin-top: 1.5rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
      border-radius: 30px;
      font-size: 0.95rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: slideInUp 0.6s ease-out 0.3s both;
    ">請檢查輸入資料後重試</div>
    
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ff6b6b, #ff8a8a, #ff6b6b);
      animation: progressError 4s linear;
    "></div>
  `;

  // 初始狀態
  toast.style.transform = "translate(-50%, -50%) scale(0.3) rotate(10deg)";
  toast.style.opacity = "0";

  // 添加升級版搖晃動畫樣式
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-8px) rotate(-2deg); }
      20%, 40%, 60%, 80% { transform: translateX(8px) rotate(2deg); }
    }
    
    @keyframes floatError {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(90deg); }
    }
    
    @keyframes pulseError {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes slideInUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes progressError {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // 顯示動畫
  setTimeout(() => {
    toast.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
    toast.style.opacity = "1";
  }, 10);

  // 4秒後自動隱藏
  setTimeout(() => {
    toast.style.transform = "translate(-50%, -50%) scale(0.7) rotate(-5deg)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 400);
  }, 4000);
};

const showTooltip = (event, movie) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const tooltipWidth = 280;
  const tooltipHeight = 320;

  const x = windowWidth - tooltipWidth - 50;
  const y = Math.max(50, (windowHeight - tooltipHeight) / 2);

  tooltip.value = {
    show: true,
    x: x,
    y: y,
    movie: movie,
  };
  tooltipImageLoaded.value = false;
};

const hideTooltip = () => {
  tooltip.value.show = false;
  tooltip.value.movie = null;
  tooltipImageLoaded.value = false;
};

const handleTooltipImageError = (event) => {
  console.log("提示框圖片載入失敗:", event.target.src);
  event.target.style.display = "none";
  tooltipImageLoaded.value = false;
};

const handleTooltipImageLoad = (event) => {
  console.log("提示框圖片載入成功");
  tooltipImageLoaded.value = true;
};

// 字數統計
const updateCharCount = () => {
  // 字數統計會自動更新
};

// 時間輸入相關
const startTimeInput = ref(null);

const focusDateTimeInput = () => {
  if (startTimeInput.value) {
    startTimeInput.value.showPicker();
  }
};

onMounted(() => {
  loadMovies();
});
</script>

<style scoped>
.create-event {
  padding: 1.5rem;
  max-width: 800px;
  margin: auto;
  background: #1a1a2e;
  border-radius: 12px;
  color: white;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
  margin-bottom: 1rem;
}

h1 {
  color: #a387ff;
  text-align: center;
  margin-bottom: 1.5rem;
}

form label {
  display: block;
  margin-top: 1.2rem;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #a387ff;
  font-size: 0.95rem;
  text-shadow: 0 0 10px rgba(163, 135, 255, 0.3);
}

input,
textarea,
select {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
}

/* 美化活動標題輸入欄位 */
input[type="text"] {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  padding: 0.8rem 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.3);
}

input[type="text"]::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

input[type="text"]:focus {
  outline: none;
  border-color: #a387ff;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  box-shadow: 0 0 20px rgba(163, 135, 255, 0.3);
  transform: translateY(-1px);
  color: #fff;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

/* 美化搜尋電影輸入欄位 */
.movie-search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.movie-search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.movie-search-input:focus {
  outline: none;
  border-color: #a387ff;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  box-shadow: 0 0 20px rgba(163, 135, 255, 0.3);
  transform: translateY(-1px);
}

/* 搜尋圖示 */
.search-icon {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a387ff;
  z-index: 2;
  font-size: 0.9rem;
}

/* 清除按鈕 */
.search-clear {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a387ff;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.search-clear:hover {
  background: rgba(163, 135, 255, 0.2);
  color: #fff;
  transform: scale(1.1);
}

/* 電影選擇區域樣式 */
.movie-selection {
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.8) 0%,
    rgba(42, 42, 74, 0.8) 100%
  );
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(163, 135, 255, 0.2);
  backdrop-filter: blur(10px);
}

.movie-search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.movie-grid-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
}

.movie-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(163, 135, 255, 0.2);
}

.movie-count {
  color: #a387ff;
  font-weight: 500;
  font-size: 0.9rem;
}

.movie-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.movie-item {
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.9) 0%,
    rgba(42, 42, 74, 0.9) 100%
  );
  border-radius: 12px;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
  position: relative;
}

.movie-item:hover {
  transform: translateX(4px);
  border-color: rgba(163, 135, 255, 0.3);
  box-shadow: 0 4px 15px rgba(163, 135, 255, 0.2);
}

.movie-item.selected {
  border-color: #a387ff;
  background: linear-gradient(
    135deg,
    rgba(163, 135, 255, 0.2) 0%,
    rgba(124, 124, 251, 0.2) 100%
  );
  box-shadow: 0 0 20px rgba(163, 135, 255, 0.3);
}

.movie-item-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  position: relative;
}

.movie-text-info {
  flex: 1;
  min-width: 0;
  position: relative;
}

.movie-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
  position: relative;
}

.movie-title {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  flex: 1;
  margin-right: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-duration {
  color: #a387ff;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.movie-english {
  color: #ccc;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  font-style: italic;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.director {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #aaa;
  font-size: 0.8rem;
}

.director i {
  color: #a387ff;
}

.movie-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  position: relative;
}

.tag {
  background: linear-gradient(
    135deg,
    rgba(163, 135, 255, 0.3) 0%,
    rgba(124, 124, 251, 0.3) 100%
  );
  color: #a387ff;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid rgba(163, 135, 255, 0.2);
  white-space: nowrap;
  flex-shrink: 0;
}

.select-indicator {
  color: #a387ff;
  font-size: 1.2rem;
}

/* 提示框樣式 */
.movie-tooltip {
  position: fixed;
  z-index: 99999;
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.98) 0%,
    rgba(42, 42, 74, 0.98) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.6);
  border-radius: 12px;
  padding: 1rem;
  width: 280px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  max-height: calc(100vh - 60px);
}

.tooltip-poster {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%);
  position: relative;
}

.tooltip-poster img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: opacity 0.3s ease;
  background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%);
}

.tooltip-poster-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%);
  color: #a387ff;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  z-index: 1;
}

.tooltip-content h4 {
  color: #fff;
  font-size: 1rem;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
}

.tooltip-english {
  color: #ccc;
  font-size: 0.85rem;
  margin: 0 0 0.4rem 0;
  font-style: italic;
}

.tooltip-meta {
  margin-bottom: 0.4rem;
}

.tooltip-duration {
  background: rgba(163, 135, 255, 0.2);
  color: #a387ff;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  border: 1px solid rgba(163, 135, 255, 0.3);
}

.tooltip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tooltip-tag {
  background: rgba(163, 135, 255, 0.2);
  color: #a387ff;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid rgba(163, 135, 255, 0.2);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

.selected-movie-info {
  background: linear-gradient(
    135deg,
    rgba(163, 135, 255, 0.1) 0%,
    rgba(124, 124, 251, 0.1) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #a387ff;
  position: relative;
  z-index: 1;
}

.selected-header i {
  font-size: 1.2rem;
}

.selected-header h4 {
  margin: 0;
  color: #a387ff;
  font-weight: 600;
}

.selected-content {
  position: relative;
  z-index: 1;
}

.selected-content h5 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.selected-plot {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.selected-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #aaa;
}

.selected-duration,
.selected-director {
  background: rgba(163, 135, 255, 0.2);
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(163, 135, 255, 0.3);
}

/* 滾動條樣式 */
.movie-list::-webkit-scrollbar {
  width: 8px;
}

.movie-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.movie-list::-webkit-scrollbar-thumb {
  background: rgba(163, 135, 255, 0.5);
  border-radius: 4px;
}

.movie-list::-webkit-scrollbar-thumb:hover {
  background: rgba(163, 135, 255, 0.7);
}

/* 時間和容納人數同行樣式 */
.time-capacity-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.time-section,
.capacity-section {
  flex: 1;
  min-width: 0;
}

.time-input-container {
  position: relative;
  width: 100%;
}

.infinity-emoji {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #a387ff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(163, 135, 255, 0.7);
  cursor: pointer;
  z-index: 2;
  animation: infinityGlow 2s ease-in-out infinite alternate;
  transition: all 0.3s ease;
  padding: 0.2rem;
  border-radius: 4px;
}

@keyframes infinityGlow {
  0% {
    text-shadow: 0 0 10px rgba(163, 135, 255, 0.7);
    transform: translateY(-50%) scale(1);
  }
  100% {
    text-shadow: 0 0 20px rgba(163, 135, 255, 0.9),
      0 0 30px rgba(163, 135, 255, 0.5);
    transform: translateY(-50%) scale(1.05);
  }
}

.infinity-emoji:hover {
  color: #fff;
  text-shadow: 0 0 25px rgba(163, 135, 255, 1),
    0 0 35px rgba(163, 135, 255, 0.7);
  transform: translateY(-50%) scale(1.15);
  background: rgba(163, 135, 255, 0.1);
}

.infinity-emoji:active {
  transform: translateY(-50%) scale(0.95);
  background: rgba(163, 135, 255, 0.2);
}

.time-section input[type="datetime-local"] {
  width: 100%;
  padding: 0.8rem 3.5rem 0.8rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.3);
  position: relative;
}

.time-section input[type="datetime-local"]:focus {
  outline: none;
  border-color: #a387ff;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  box-shadow: 0 0 20px rgba(163, 135, 255, 0.3);
  transform: translateY(-1px);
  color: #fff;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.time-section input[type="datetime-local"]:hover {
  border-color: rgba(163, 135, 255, 0.5);
  box-shadow: 0 4px 15px rgba(163, 135, 255, 0.2);
}

.time-section input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  display: none;
}

.time-section input[type="datetime-local"]::-moz-calendar-picker-indicator {
  display: none;
}

.capacity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  padding: 0.8rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.capacity-control:hover {
  border-color: #a387ff;
  box-shadow: 0 0 15px rgba(163, 135, 255, 0.2);
  transform: translateY(-1px);
}

.capacity-control button {
  background: linear-gradient(135deg, #a387ff 0%, #7c7cfb 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(163, 135, 255, 0.3);
  font-size: 1.1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capacity-control button:hover {
  background: linear-gradient(135deg, #7c7cfb 0%, #a387ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(163, 135, 255, 0.4);
}

.capacity-control button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(163, 135, 255, 0.3);
}

.capacity-input {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  width: 3.5rem;
  height: 2.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.3);
  padding: 0;
  margin: 0;
  line-height: 2.5rem;
  vertical-align: middle;
}

.capacity-input:focus {
  outline: none;
  border-color: #a387ff;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  box-shadow: 0 0 15px rgba(163, 135, 255, 0.3);
  transform: translateY(-1px);
  color: #fff;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.capacity-input:hover {
  border-color: rgba(163, 135, 255, 0.5);
  box-shadow: 0 2px 8px rgba(163, 135, 255, 0.2);
}

.capacity-input::-webkit-outer-spin-button,
.capacity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.capacity-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* 活動說明優化樣式 */
.description-container {
  position: relative;
  margin-bottom: 1rem;
}

.description-textarea {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.3);
  line-height: 1.5;
}

.description-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.description-textarea:focus {
  outline: none;
  border-color: #a387ff;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  box-shadow: 0 0 20px rgba(163, 135, 255, 0.3);
  transform: translateY(-1px);
  color: #fff;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.description-textarea:hover {
  border-color: rgba(163, 135, 255, 0.5);
  box-shadow: 0 4px 15px rgba(163, 135, 255, 0.2);
}

/* 錯誤訊息樣式 */
.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  animation: errorShake 0.5s ease-in-out;
  background: rgba(255, 107, 107, 0.1);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.error-message i {
  color: #ff6b6b;
  font-size: 0.8rem;
}

@keyframes errorShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* 按鈕樣式 */
.btn-row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.back-btn,
.submit-btn {
  background: #a387ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover,
.submit-btn:hover:not(:disabled) {
  background: #7e5de4;
}

.submit-btn {
  font-weight: bold;
  min-width: 160px;
}

.submit-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-btn:not(:disabled) {
  background: linear-gradient(90deg, #a387ff 60%, #7c7cfb 100%);
  box-shadow: 0 0 15px rgba(163, 135, 255, 0.3);
}

.submit-btn:not(:disabled):hover {
  background: linear-gradient(90deg, #7c7cfb 60%, #a387ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(163, 135, 255, 0.4);
}
</style>
