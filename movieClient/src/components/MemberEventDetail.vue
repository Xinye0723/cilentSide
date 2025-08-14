<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

// 響應式變數
const event = ref(null);
const hasSignedUp = ref(false);
const isPaid = ref(false);
const loading = ref(true);
const showPaymentCountdown = ref(false);
const countdownTime = ref(null);
const countdownInterval = ref(null);
const isProcessingPayment = ref(false);
const isRedirectingToPayment = ref(false);

// 付款視窗相關
const showPaymentModal = ref(false);
const paymentMethod = ref("credit");
const paymentLoading = ref(false);

// 分享相關
const showShareMenu = ref(false);

// 計算屬性
const isOrganizer = computed(() => {
  if (!event.value || !auth.memberId) return false;
  return Number(event.value.organizerId) === Number(auth.memberId);
});

// 檢查會員是否已報名此活動
const checkSignupStatus = async (eventId) => {
  try {
    const memberId = auth.memberId; // 假設會員ID存在localStorage

    if (!memberId) {
      console.log("未登入會員");
      return;
    }

    const res = await fetch(
      `https://localhost:7181/api/MemberEvent/CheckJoinStatus?eventId=${eventId}&memberId=${memberId}`
    );

    if (res.ok) {
      const data = await res.json();

      // 避免不必要的狀態更新
      const newHasSignedUp = data.isJoined || false;
      const newIsPaid = data.isPaid || false;

      // 只有當狀態真正改變時才更新
      if (hasSignedUp.value !== newHasSignedUp || isPaid.value !== newIsPaid) {
        hasSignedUp.value = newHasSignedUp;
        isPaid.value = newIsPaid;

        console.log(
          `狀態更新: hasSignedUp=${hasSignedUp.value}, isPaid=${isPaid.value}`
        );
      }

      // 如果已付款，隱藏倒數視窗
      if (hasSignedUp.value && data.isPaid) {
        showPaymentCountdown.value = false;
        if (countdownInterval.value) {
          clearInterval(countdownInterval.value);
          countdownInterval.value = null;
        }
        console.log("✅ 用戶已付款，隱藏倒數視窗");
      }
      // 如果已報名但未付款，顯示倒數視窗
      else if (hasSignedUp.value && !data.isPaid) {
        showPaymentCountdown.value = true;
        startCountdown(data.remainingTime);
        console.log("⏰ 用戶未付款，顯示倒數視窗");
      }
      // 如果未報名，隱藏倒數視窗
      else {
        showPaymentCountdown.value = false;
        if (countdownInterval.value) {
          clearInterval(countdownInterval.value);
          countdownInterval.value = null;
        }
        console.log("❌ 用戶未報名");
      }
    }
  } catch (error) {
    console.error("檢查報名狀態失敗:", error);
  }
};

// 開始倒數
const startCountdown = (remainingTimeMs) => {
  let endTime;

  if (remainingTimeMs > 0) {
    endTime = new Date().getTime() + remainingTimeMs;
  } else {
    endTime = new Date().getTime() + 24 * 60 * 60 * 1000;
  }

  const updateCountdown = async () => {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance > 0) {
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownTime.value = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      clearInterval(countdownInterval.value);
      showPaymentCountdown.value = false;
      hasSignedUp.value = false;
      showSuccessMessage("付款時間已過，報名已取消");
      await checkSignupStatus(route.params.id);
    }
  };

  updateCountdown();
  countdownInterval.value = setInterval(updateCountdown, 1000);
};

// 頁面可見性檢測
const handleVisibilityChange = async () => {
  if (!document.hidden && event.value) {
    console.log("頁面重新可見，立即檢查付款狀態");

    if (isProcessingPayment.value) {
      const memberId = auth.memberId;
      if (memberId) {
        try {
          const updateRes = await fetch(
            `https://localhost:7181/api/MemberEvent/UpdatePaymentStatus`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                eventId: event.value.memberEventId,
                memberId: parseInt(memberId),
              }),
            }
          );

          if (updateRes.ok) {
            console.log("付款狀態已更新");
            isProcessingPayment.value = false;
          }
        } catch (error) {
          console.error("更新付款狀態失敗:", error);
        }
      }
    }

    await checkSignupStatus(event.value.memberEventId);
  }
};

// 在 script setup 中添加動態設置 meta 標籤的函數
const updateMetaTags = (eventData) => {
  if (!eventData) return;

  // 設置 Open Graph 標籤
  const metaTags = {
    "og:title": eventData.title || "揪團活動",
    "og:description": eventData.description || "歡迎參加我們的電影揪團活動！",
    "og:image": "https://your-domain.com/event-image.jpg", // 您需要上傳一張活動圖片
    "og:url": window.location.href,
    "og:type": "website",
    "og:site_name": "INFINITY CINEMA",
    "og:locale": "zh_TW",

    // Twitter Card 標籤
    "twitter:card": "summary_large_image",
    "twitter:title": eventData.title || "揪團活動",
    "twitter:description":
      eventData.description || "歡迎參加我們的電影揪團活動！",
    "twitter:image": "https://your-domain.com/event-image.jpg",
  };

  // 更新或創建 meta 標籤
  Object.entries(metaTags).forEach(([property, content]) => {
    let meta =
      document.querySelector(`meta[property="${property}"]`) ||
      document.querySelector(`meta[name="${property}"]`);

    if (!meta) {
      meta = document.createElement("meta");
      if (property.startsWith("og:")) {
        meta.setAttribute("property", property);
      } else {
        meta.setAttribute("name", property);
      }
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", content);
  });

  // 更新頁面標題
};

// 組件掛載
onMounted(async () => {
  const id = route.params.id;
  try {
    // 清理可能殘留的覆蓋層
    const overlay = document.getElementById("payment-overlay");
    if (overlay) {
      document.body.removeChild(overlay);
    }

    const res = await fetch(`https://localhost:7181/api/MemberEvent/${id}`);
    if (res.ok) {
      const data = await res.json();
      event.value = {
        ...data,
        startTime: data.startTime
          ? new Date(data.startTime).toLocaleDateString("zh-TW") +
            " " +
            new Date(data.startTime).toLocaleTimeString("zh-TW", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "時間未定",
      };

      console.log("活動資料:", event.value); // 添加調試資訊
      console.log("當前會員ID:", auth.memberId);
      console.log("主辦人ID:", event.value.organizerId);
      console.log("是否為主辦人:", isOrganizer.value);

      // 更新 meta 標籤
      updateMetaTags(event.value);

      // 重置狀態，避免舊狀態影響
      isRedirectingToPayment.value = false;
      hasSignedUp.value = false;
      isPaid.value = false;
      showPaymentCountdown.value = false;

      // 檢查報名狀態
      await checkSignupStatus(id);

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // 設置狀態檢查間隔，但只在需要時檢查
      const statusCheckInterval = setInterval(async () => {
        if (
          event.value &&
          hasSignedUp.value &&
          !isPaid.value &&
          !showPaymentCountdown.value
        ) {
          console.log("輪詢檢查付款狀態...");
          await checkSignupStatus(id);
        }
      }, 10000);

      onUnmounted(() => {
        clearInterval(statusCheckInterval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      });
    } else {
      event.value = null;
    }
  } catch (err) {
    event.value = null;
  } finally {
    loading.value = false;
  }
});

// 組件卸載時清理
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

// 導航函數
function goBack() {
  router.push("/memberEvent");
}

// 報名或取消報名
async function signupOrCancel() {
  if (!event.value) return;

  try {
    const memberId = auth.memberId;
    if (!memberId) {
      showSuccessMessage("請先登入會員");
      return;
    }

    const action = hasSignedUp.value ? "leave" : "join";

    // 如果是取消報名，先顯示確認視窗
    if (action === "leave") {
      showCancelJoinConfirm();
      return;
    }

    console.log(
      `執行操作: ${action}, 當前狀態: hasSignedUp=${hasSignedUp.value}, isPaid=${isPaid.value}`
    );

    // 立即設置重定向狀態，防止閃現
    isRedirectingToPayment.value = true;

    const res = await fetch(
      `https://localhost:7181/api/MemberEvent/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.value.memberEventId,
          memberId: memberId,
        }),
      }
    );

    if (res.ok) {
      if (action === "join") {
        // 先更新本地狀態
        event.value.registered += 1;
        hasSignedUp.value = true;
        isPaid.value = false; // 確保付款狀態為 false

        console.log("報名成功，狀態更新為: hasSignedUp=true, isPaid=false");

        // 延遲一下再檢查狀態，避免閃現
        setTimeout(async () => {
          await checkSignupStatus(event.value.memberEventId);
          // 檢查完成後，重置重定向狀態
          isRedirectingToPayment.value = false;
        }, 100);
      }
    } else {
      const errorData = await res.json();
      showSuccessMessage(errorData.error || "操作失敗，請稍後再試");
      // 如果失敗，也要重置重定向狀態
      isRedirectingToPayment.value = false;
    }
  } catch (error) {
    console.error("報名操作失敗:", error);
    showSuccessMessage("操作失敗，請稍後再試");
    // 如果出錯，也要重置重定向狀態
    isRedirectingToPayment.value = false;
  }
}

// 實際執行取消報名的函數
async function executeCancelJoin() {
  if (!event.value) return;

  try {
    const memberId = auth.memberId;
    if (!memberId) {
      showSuccessMessage("請先登入會員");
      return;
    }

    const res = await fetch(`https://localhost:7181/api/MemberEvent/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: event.value.memberEventId,
        memberId: memberId,
      }),
    });

    if (res.ok) {
      // 取消報名時，重置所有相關狀態
      if (event.value.registered > 0) {
        event.value.registered -= 1;
      }
      hasSignedUp.value = false;
      isPaid.value = false;
      showPaymentCountdown.value = false;
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
      }
      console.log("取消報名成功，狀態重置為: hasSignedUp=false, isPaid=false");
      showSuccessMessage("取消報名成功！");

      // 延遲重新檢查狀態，避免閃現
      setTimeout(async () => {
        await checkSignupStatus(event.value.memberEventId);
      }, 100);
    } else {
      const errorData = await res.json();
      showSuccessMessage(errorData.error || "操作失敗，請稍後再試");
    }
  } catch (error) {
    console.error("取消報名失敗:", error);
    showSuccessMessage("操作失敗，請稍後再試");
  }
}

// 立即付款
const payNow = () => {
  console.log("點擊立即付款按鈕");
  // 設置重定向狀態，防止閃現
  isRedirectingToPayment.value = true;
  // 隱藏倒數視窗
  showPaymentCountdown.value = false;
  // 顯示付款模態視窗
  showPaymentModal.value = true;
};

// 確認付款（在模態視窗中點擊確認付款按鈕時調用）
const confirmPayment = () => {
  console.log("確認付款，跳轉到綠界");
  processPayment();
};

// 付款處理函數
const processPayment = async () => {
  if (paymentLoading.value) return;

  try {
    paymentLoading.value = true;
    isProcessingPayment.value = true;

    const memberId = auth.memberId;
    const memberName = auth.memberName || "會員";

    // 先立即更新付款狀態為成功
    try {
      const updateRes = await fetch(
        `https://localhost:7181/api/MemberEvent/UpdatePaymentStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId: event.value.memberEventId,
            memberId: parseInt(memberId),
          }),
        }
      );

      if (updateRes.ok) {
        console.log("✅ 付款狀態已立即設為成功");
        isPaid.value = true;
        showPaymentCountdown.value = false;
        if (countdownInterval.value) {
          clearInterval(countdownInterval.value);
        }
      }
    } catch (error) {
      console.error("更新付款狀態失敗:", error);
    }

    // 立即創建黑色覆蓋層
    const overlay = document.createElement("div");
    overlay.id = "payment-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000000;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      font-family: Arial, sans-serif;
    `;
    overlay.innerHTML = "Loading....";
    document.body.appendChild(overlay);

    // 呼叫綠界付款 API
    const res = await fetch(
      `https://localhost:7181/api/Ecpay/CreateEventOrder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.value.memberEventId,
          eventTitle: event.value.title || "揪團活動",
          memberId: parseInt(memberId),
          memberName: memberName,
          amount: event.value.price || 250,
          email: "test@example.com",
          payMethod: paymentMethod.value,
          returnUrl: "https://23f75888ce40.ngrok-free.app/api/Ecpay/Notify",
          clientBackUrl: `http://localhost:5173/memberEventDetail/${event.value.memberEventId}`,
          eventDate: event.value.startTime?.split(" ")[0] || "",
          eventTime: event.value.startTime?.split(" ")[1] || "",
          theaterNumber: event.value.theaterNumber || 0,
          movieName: event.value.title || "",
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();

      // 立即跳轉到綠界付款頁面
      const doc = new DOMParser().parseFromString(data.formHtml, "text/html");
      const form = doc.querySelector("form");
      if (form) {
        document.body.appendChild(form);
        form.submit();
      } else {
        showSuccessMessage("付款表單生成失敗");
        document.body.removeChild(overlay);
        isProcessingPayment.value = false;
      }
    } else {
      const errorData = await res.json();
      showSuccessMessage(errorData.error || "付款失敗");
      document.body.removeChild(overlay);
      isProcessingPayment.value = false;
    }
  } catch (err) {
    console.error("付款錯誤:", err);
    showSuccessMessage("付款失敗，請稍後再試");
    const overlay = document.getElementById("payment-overlay");
    if (overlay) {
      document.body.removeChild(overlay);
    }
    isProcessingPayment.value = false;
  } finally {
    paymentLoading.value = false;
  }
};

// 關閉付款視窗
const closePaymentModal = () => {
  showPaymentModal.value = false;
  // 重置重定向狀態
  isRedirectingToPayment.value = false;
};

// 美觀的取消活動確認視窗 - 影城黑紫粉配色版
const showCancelEventConfirm = () => {
  // 移除現有的確認視窗
  const existingConfirm = document.querySelectorAll(".cancel-event-confirm");
  existingConfirm.forEach((confirm) => {
    if (document.body.contains(confirm)) {
      document.body.removeChild(confirm);
    }
  });

  const confirmModal = document.createElement("div");
  confirmModal.className = "cancel-event-confirm";

  // 設置樣式 - 影城黑紫粉配色風格
  confirmModal.style.position = "fixed";
  confirmModal.style.top = "50%";
  confirmModal.style.left = "50%";
  confirmModal.style.transform = "translate(-50%, -50%)";
  confirmModal.style.padding = "2.5rem";
  confirmModal.style.borderRadius = "25px";
  confirmModal.style.zIndex = "99999";
  confirmModal.style.fontSize = "1.1rem";
  confirmModal.style.boxShadow =
    "0 25px 80px rgba(179, 136, 255, 0.3), 0 10px 40px rgba(0, 0, 0, 0.25)";
  confirmModal.style.backdropFilter = "blur(25px)";
  confirmModal.style.maxWidth = "500px";
  confirmModal.style.fontWeight = "600";
  confirmModal.style.transition =
    "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
  confirmModal.style.display = "flex";
  confirmModal.style.flexDirection = "column";
  confirmModal.style.alignItems = "center";
  confirmModal.style.gap = "1.5rem";
  confirmModal.style.textAlign = "center";
  confirmModal.style.border = "2px solid rgba(255, 255, 255, 0.4)";
  confirmModal.style.background =
    "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(42, 42, 74, 0.95) 50%, rgba(26, 26, 46, 0.95) 100%)";
  confirmModal.style.color = "#f3f3fa";
  confirmModal.style.overflow = "hidden";

  // 添加背景裝飾元素
  confirmModal.innerHTML = `
    <div style="
      position: absolute;
      top: -50px;
      right: -50px;
      width: 100px;
      height: 100px;
      background: rgba(179, 136, 255, 0.15);
      border-radius: 50%;
      animation: float 3s ease-in-out infinite;
    "></div>
    <div style="
      position: absolute;
      bottom: -30px;
      left: -30px;
      width: 60px;
      height: 60px;
      background: rgba(255, 105, 180, 0.12);
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
      border: 3px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 8px 32px rgba(179, 136, 255, 0.2);
      color: #e91e63;
      font-weight: bold;
    ">∞</div>
    
    <div style="
      font-size: 1.4rem; 
      font-weight: 700; 
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      background: linear-gradient(45deg, #b388ff, #ff69b4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    ">確定要取消此活動嗎？</div>
    
    <div style="
      background: linear-gradient(135deg, rgba(179, 136, 255, 0.15) 0%, rgba(255, 105, 180, 0.1) 100%);
      border-radius: 20px;
      padding: 1.5rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(179, 136, 255, 0.1);
      animation: slideInUp 0.6s ease-out 0.3s both;
      max-width: 400px;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: #ff69b4;
        font-weight: 600;
      ">
        <span style="font-size: 1.2rem;">⚠️</span>
        <span>注意事項</span>
      </div>
      <div style="
        text-align: left;
        line-height: 1.6;
        font-size: 0.95rem;
        color: #f3f3fa;
      ">
        <div style="margin-bottom: 0.5rem;">• 活動取消後無法恢復</div>
        <div style="margin-bottom: 0.5rem;">• 所有已報名的參加者將被自動取消</div>
        <!-- <div>• 已付款的參加者將獲得退款</div> -->
      </div>
    </div>
    
    <div style="
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    ">
      <button id="confirmCancelBtn" style="
        padding: 0.8rem 2rem;
        background: linear-gradient(135deg, #b388ff 0%, #7c7cfb 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(179, 136, 255, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.2);
      ">確定取消</button>
      
      <button id="cancelCancelBtn" style="
        padding: 0.8rem 2rem;
        background: linear-gradient(135deg, rgba(255, 105, 180, 0.25) 0%, rgba(255, 105, 180, 0.15) 100%);
        color: #ff69b4;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      ">返回</button>
    </div>
  `;

  // 初始狀態
  confirmModal.style.transform =
    "translate(-50%, -50%) scale(0.3) rotate(-10deg)";
  confirmModal.style.opacity = "0";

  // 添加動畫樣式
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounceIn {
      0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      50% { transform: scale(1.1) rotate(5deg); }
      70% { transform: scale(0.9) rotate(-2deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
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
  `;
  document.head.appendChild(style);

  document.body.appendChild(confirmModal);

  // 顯示動畫
  setTimeout(() => {
    confirmModal.style.transform =
      "translate(-50%, -50%) scale(1) rotate(0deg)";
    confirmModal.style.opacity = "1";
  }, 10);

  // 添加按鈕事件
  const confirmBtn = confirmModal.querySelector("#confirmCancelBtn");
  const cancelBtn = confirmModal.querySelector("#cancelCancelBtn");

  confirmBtn.addEventListener("click", () => {
    // 隱藏確認視窗
    confirmModal.style.transform =
      "translate(-50%, -50%) scale(0.7) rotate(5deg)";
    confirmModal.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(confirmModal)) {
        document.body.removeChild(confirmModal);
      }
      // 執行取消活動邏輯
      executeCancelEvent();
    }, 400);
  });

  cancelBtn.addEventListener("click", () => {
    // 隱藏確認視窗
    confirmModal.style.transform =
      "translate(-50%, -50%) scale(0.7) rotate(-5deg)";
    confirmModal.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(confirmModal)) {
        document.body.removeChild(confirmModal);
      }
    }, 400);
  });

  // 移除自動隱藏功能，讓用戶手動關閉
};

// 執行取消活動的邏輯
const executeCancelEvent = async () => {
  if (!event.value || !isOrganizer.value) return;

  try {
    const res = await fetch(
      `https://localhost:7181/api/MemberEvent/cancel/${event.value.memberEventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      showSuccessMessage("活動已成功取消！");
      // 更新活動狀態
      event.value.status = "已取消";
      // 延遲跳轉到活動主頁
      setTimeout(() => {
        router.push("/memberEvent");
      }, 2000);
    } else {
      const errorData = await res.json();
      showSuccessMessage(errorData.error || "取消活動失敗，請稍後再試");
    }
  } catch (error) {
    console.error("取消活動失敗:", error);
    showSuccessMessage("取消活動失敗，請稍後再試");
  }
};

// 修改原有的強制取消活動函數
const forceCancelEvent = async () => {
  if (!event.value || !isOrganizer.value) return;

  // 使用新的美觀確認視窗
  showCancelEventConfirm();
};

// 取消報名（從倒數視窗）
const cancelFromCountdown = async () => {
  showCancelJoinConfirm();
};

// 分享功能
const shareEvent = async () => {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    showSuccessMessage("連結已複製到剪貼簿！");
  } catch (err) {
    showSuccessMessage("複製失敗，請手動複製連結");
  }
};

// 改進 Facebook 分享功能
const shareToFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  const title = event.value?.title || "揪團活動";
  const description =
    event.value?.description || "歡迎參加我們的電影揪團活動！";
  const time = event.value?.startTime || "";
  const location = `影廳 ${event.value?.theaterNumber || ""} 號`;

  // 組合更豐富的分享文字
  const shareText = `${title}\n\n${description}\n\n🎬 時間：${time}\n🏢 地點：${location}\n\n🎉 快來一起看電影吧！`;

  // 使用 Facebook 分享 API
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(
    shareText
  )}`;

  // 在新視窗中打開分享
  const shareWindow = window.open(
    shareUrl,
    "_blank",
    "width=600,height=400,scrollbars=yes,resizable=yes"
  );

  // 監聽分享視窗關閉事件
  if (shareWindow) {
    const checkClosed = setInterval(() => {
      if (shareWindow.closed) {
        clearInterval(checkClosed);
        showSuccessMessage("分享完成！");
      }
    }, 1000);
  }

  showShareMenu.value = false;
};

const shareToLine = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`${event.value?.title || "揪團活動"}`);
  window.open(
    `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`,
    "_blank"
  );
  showShareMenu.value = false;
};

const toggleShareMenu = () => {
  showShareMenu.value = !showShareMenu.value;
};

// 提示訊息函數
const showSuccessMessage = (message) => {
  const existingToasts = document.querySelectorAll(".custom-toast");
  existingToasts.forEach((toast) => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  });

  const toast = document.createElement("div");
  toast.className = "custom-toast";

  toast.style.position = "fixed";
  toast.style.top = "100px";
  toast.style.right = "20px";
  toast.style.padding = "1.5rem";
  toast.style.borderRadius = "12px";
  toast.style.zIndex = "99999";
  toast.style.fontSize = "0.9rem";
  toast.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
  toast.style.backdropFilter = "blur(10px)";
  toast.style.maxWidth = "350px";
  toast.style.fontWeight = "500";
  toast.style.transition = "all 0.3s ease";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "0.8rem";

  if (message.includes("失敗") || message.includes("錯誤")) {
    toast.style.border = "1px solid rgba(255, 107, 107, 0.2)";
    toast.style.background = "rgba(255, 107, 107, 0.95)";
    toast.style.color = "#fff";

    toast.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255, 107, 107, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
      ">❌</div>
      <span style="font-size: 0.9rem; line-height: 1.4;">${message}</span>
    `;
  } else if (message.includes("成功")) {
    if (message.includes("取消報名成功")) {
      toast.style.border = "1px solid rgba(255, 107, 107, 0.2)";
      toast.style.background = "rgba(255, 107, 107, 0.1)";
      toast.style.color = "#ff6b6b";

      toast.innerHTML = `
        <span style="font-size: 0.9rem; line-height: 1.4;">${message}</span>
      `;
    } else if (message.includes("活動已成功取消")) {
      // ✅ 新增：取消活動成功的特殊樣式
      toast.style.border = "1px solid rgba(76, 175, 80, 0.2)";
      toast.style.background = "rgba(76, 175, 80, 0.1)";
      toast.style.color = "#4CAF50";

      toast.innerHTML = `
        <span style="font-size: 0.9rem; line-height: 1.4;">${message}</span>
      `;
    } else {
      toast.style.border = "1px solid rgba(76, 175, 80, 0.2)";
      toast.style.background = "rgba(76, 175, 80, 0.1)";
      toast.style.color = "#4CAF50";

      toast.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        ">✅</div>
        <span style="font-size: 0.9rem; line-height: 1.4;">${message}</span>
      `;
    }
  } else {
    toast.style.border = "1px solid rgba(179, 136, 255, 0.2)";
    toast.style.background = "rgba(179, 136, 255, 0.1)";
    toast.style.color = "#b388ff";

    toast.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(179, 136, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
      ">ℹ️</div>
      <span style="font-size: 0.9rem; line-height: 1.4;">${message}</span>
    `;
  }

  toast.style.transform = "translateX(100%)";
  toast.style.opacity = "0";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";

    if (message.includes("失敗") || message.includes("錯誤")) {
      setTimeout(() => {
        toast.style.animation = "shake 0.6s ease-in-out";
        setTimeout(() => {
          if (document.body.contains(toast)) {
            toast.style.transform = "translateX(100%)";
            toast.style.opacity = "0";
            setTimeout(() => {
              if (document.body.contains(toast)) {
                document.body.removeChild(toast);
              }
            }, 300);
          }
        }, 600);
      }, 500);
    } else if (message.includes("取消報名成功")) {
      // ✅ 取消報名成功訊息消失得更快
      setTimeout(() => {
        if (document.body.contains(toast)) {
          toast.style.transform = "translateX(100%)";
          toast.style.opacity = "0";
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }
      }, 1500); // 從 3000ms 縮短到 1500ms
    } else {
      setTimeout(() => {
        if (document.body.contains(toast)) {
          toast.style.transform = "translateX(100%)";
          toast.style.opacity = "0";
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }
      }, 3000);
    }
  }, 10);
};

// 隱藏倒數視窗
const hideCountdown = () => {
  showPaymentCountdown.value = false;
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }
};

// 取消報名確認視窗（一般會員）
const showCancelJoinConfirm = () => {
  // 移除現有的確認視窗
  const existingModal = document.querySelector(".cancel-join-modal");
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  const modal = document.createElement("div");
  modal.className = "cancel-join-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(8px);
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 2px solid white;
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 450px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
  `;

  // 添加浮動裝飾元素
  const decorations = [
    { top: "10%", left: "10%", size: "8px", delay: "0s" },
    { top: "20%", right: "15%", size: "12px", delay: "0.5s" },
    { top: "70%", left: "20%", size: "6px", delay: "1s" },
    { top: "80%", right: "25%", size: "10px", delay: "1.5s" },
  ];

  decorations.forEach((dec, index) => {
    const decEl = document.createElement("div");
    decEl.style.cssText = `
      position: absolute;
      width: ${dec.size};
      height: ${dec.size};
      background: linear-gradient(45deg, #e91e63, #9c27b0, #673ab7);
      border-radius: 50%;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
      animation-delay: ${dec.delay};
      ${dec.top ? `top: ${dec.top};` : ""}
      ${dec.left ? `left: ${dec.left};` : ""}
      ${dec.right ? `right: ${dec.right};` : ""}
    `;
    modalContent.appendChild(decEl);
  });

  // 主要警告符號（使用影城符號）
  const warningIcon = document.createElement("div");
  warningIcon.innerHTML = "∞";
  warningIcon.style.cssText = `
    font-size: 4rem;
    color: #e91e63;
    margin-bottom: 1.5rem;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(233, 30, 99, 0.5);
    animation: pulse 2s ease-in-out infinite;
  `;

  // 標題
  const title = document.createElement("h2");
  title.textContent = "確認取消報名";
  title.style.cssText = `
    color: white;
    font-size: 1.8rem;
    margin-bottom: 1rem;
    font-weight: 600;
  `;

  // 描述文字
  const description = document.createElement("p");
  description.textContent = "您確定要取消報名這個活動嗎？";
  description.style.cssText = `
    color: #b0b0b0;
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  `;

  // 按鈕容器
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  `;

  // 取消按鈕
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "繼續參加";
  cancelBtn.style.cssText = `
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid white;
    min-width: 120px;
  `;

  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.transform = "translateY(-2px)";
    cancelBtn.style.boxShadow = "0 8px 25px rgba(76, 175, 80, 0.4)";
  });

  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.transform = "translateY(0)";
    cancelBtn.style.boxShadow = "none";
  });

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // 確認取消按鈕
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "確定取消";
  confirmBtn.style.cssText = `
    background: linear-gradient(135deg, #e91e63, #c2185b);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid white;
    min-width: 120px;
  `;

  confirmBtn.addEventListener("mouseenter", () => {
    confirmBtn.style.transform = "translateY(-2px)";
    confirmBtn.style.boxShadow = "0 8px 25px rgba(233, 30, 99, 0.4)";
  });

  confirmBtn.addEventListener("mouseleave", () => {
    confirmBtn.style.transform = "translateY(0)";
    confirmBtn.style.boxShadow = "none";
  });

  confirmBtn.addEventListener("click", async () => {
    document.body.removeChild(modal);
    // 執行取消報名
    await executeCancelJoin();
  });

  // 組裝視窗
  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(confirmBtn);
  modalContent.appendChild(warningIcon);
  modalContent.appendChild(title);
  modalContent.appendChild(description);
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // 點擊背景關閉視窗
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // 添加動畫效果
  modal.style.animation = "fadeIn 0.3s ease-out";
  modalContent.style.animation = "slideInUp 0.4s ease-out";
};
</script>

<template>
  <div class="event-detail" v-if="event">
    <div class="title-row">
      <h1>{{ event.title }}</h1>
    </div>
    <div v-if="isOrganizer" class="organizer-badge">
      <span class="badge-text">我是主辦人</span>
    </div>
    <p class="desc">{{ event.description || "無活動說明" }}</p>
    <div class="info-list">
      <div class="info-item">
        <span class="label">時間：</span>{{ event.startTime }}
      </div>
      <div class="info-item">
        <span class="label">地點：</span>影廳 {{ event.theaterNumber }} 號
      </div>
      <div class="info-item">
        <span class="label">報名人數：</span>{{ event.registered }}/{{
          event.maxCapacity
        }}
      </div>
      <div class="info-item">
        <span class="label">狀態：</span>{{ event.status || "無" }}
      </div>
    </div>

    <!-- 狀態顯示 -->
    <div
      class="signup-status"
      v-if="
        hasSignedUp &&
        !showPaymentCountdown &&
        !isRedirectingToPayment &&
        !isPaid
      "
    >
      <p class="status-msg">✅ 您已報名此活動，請完成付款</p>
    </div>

    <!-- 已付款成功顯示 -->
    <div
      v-if="hasSignedUp && isPaid && !isRedirectingToPayment"
      class="success-status"
    >
      <div class="success-icon">{{ isOrganizer ? "∞" : "🎉" }}</div>
      <div class="success-text">
        <h3>{{ isOrganizer ? "主辦人狀態" : "報名成功！" }}</h3>
        <p v-if="isOrganizer">您已成功創建並參加此活動</p>
        <p v-else>您已成功報名並完成付款</p>
        <p class="event-info">活動：{{ event?.title }}</p>
        <p class="event-info">時間：{{ event?.startTime }}</p>
      </div>
    </div>

    <!-- 按鈕區域 -->
    <div class="btn-row">
      <button class="back-btn" @click="goBack">返回活動主頁</button>

      <!-- 簡化的報名按鈕邏輯 -->
      <button
        v-if="!hasSignedUp && !isOrganizer"
        class="signup-btn"
        @click="signupOrCancel"
      >
        我要報名
      </button>

      <!-- 簡化的取消報名按鈕邏輯 -->
      <button
        v-if="hasSignedUp && !isOrganizer"
        class="cancel-btn"
        @click="signupOrCancel"
      >
        取消報名
      </button>

      <!-- 強制取消活動按鈕（只有主辦人顯示） -->
      <button
        v-if="hasSignedUp && isOrganizer"
        class="force-cancel-btn"
        @click="forceCancelEvent"
      >
        取消活動
      </button>

      <!-- 分享按鈕 -->
      <div class="share-container">
        <button @click="toggleShareMenu" class="share-btn">
          <i class="bi bi-share"></i>
          分享活動
        </button>

        <!-- 分享選單 -->
        <div v-if="showShareMenu" class="share-menu">
          <button @click="shareEvent" class="share-option">
            <i class="bi bi-link-45deg"></i>
            複製連結
          </button>
          <button @click="shareToFacebook" class="share-option">
            <i class="bi bi-facebook"></i>
            分享到 Facebook
          </button>
          <button @click="shareToLine" class="share-option">
            <i class="bi bi-chat-dots"></i>
            分享到 Line
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="loading">
    <p>載入中...</p>
  </div>
  <div v-else class="not-found">
    <p>找不到這個活動</p>
  </div>

  <!-- 24小時倒數付款視窗 -->
  <div v-if="showPaymentCountdown" class="payment-countdown-toast">
    <div class="countdown-header">
      <h3>⏰ 付款倒數</h3>
      <button @click="hideCountdown" class="close-countdown-btn">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div class="countdown-content">
      <p class="countdown-message">您已參加此活動，請在期限內完成付款</p>

      <div class="countdown-timer">
        <span class="timer-icon">⏰</span>
        <span class="timer-text">{{ countdownTime }}</span>
      </div>

      <div class="countdown-actions">
        <button @click="payNow" class="pay-now-btn">立即付款</button>
        <button @click="cancelFromCountdown" class="cancel-reg-btn">
          取消報名
        </button>
      </div>
    </div>
  </div>

  <!-- 付款視窗 -->
  <div
    v-if="showPaymentModal"
    class="payment-modal-overlay"
    @click="closePaymentModal"
  >
    <div class="payment-modal" @click.stop>
      <div class="payment-header">
        <h3>完成付款</h3>
        <button @click="closePaymentModal" class="close-btn">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="payment-content">
        <div class="event-summary">
          <h4>{{ event?.title }}</h4>
          <div class="event-details">
            <span>影廳：{{ event?.theaterNumber }} 號</span>
            <span>時間：{{ event?.startTime }}</span>
          </div>
        </div>

        <div class="payment-methods">
          <h4>選擇付款方式</h4>
          <div class="method-options">
            <label class="method-option">
              <input
                type="radio"
                v-model="paymentMethod"
                value="credit"
                checked
              />
              <span class="method-icon">💳</span>
              <span>信用卡</span>
            </label>
          </div>
        </div>

        <div class="payment-total">
          <span>總計：</span>
          <span class="total-amount">NT$ {{ event?.price || 250 }}</span>
        </div>
      </div>

      <div class="payment-actions">
        <button
          @click="confirmPayment"
          class="confirm-btn"
          :disabled="paymentLoading"
        >
          {{ paymentLoading ? "處理中..." : "確認付款" }}
        </button>
        <button @click="closePaymentModal" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<style>
/* 全域樣式 - 修改整個頁面背景 */
/* body {
  background: linear-gradient(
    135deg,
    #1a1a2e 0%,
    #16213e 50%,
    #0f3460 100%
  ) !important;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

html {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
} */
</style>

<style scoped>
.event-detail {
  position: relative;
  max-width: 600px;
  margin: 6rem auto 2rem auto;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 0 25px #a387ff44, 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 2.5rem 2rem;
  color: #fff;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
  border: 1px solid rgba(163, 135, 255, 0.1);
}

/* 標題行樣式 */
.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.2rem;
  position: relative;
}

h1 {
  color: #a387ff;
  margin-bottom: 1.2rem;
  font-size: 2rem;
  text-align: center;
  margin: 0;
}

.desc {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
}

.info-list {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: rgba(163, 135, 255, 0.1);
  border-radius: 8px;
}

.label {
  font-weight: bold;
  color: #a387ff;
  min-width: 100px;
}

.btn-container {
  margin-top: 2rem;
  position: relative;
}

.btn-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 1rem;
}

.back-btn,
.signup-btn,
.cancel-btn,
.organizer-btn,
.force-cancel-btn,
.share-btn {
  position: relative;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  min-width: 140px;
  justify-content: center;
  height: 48px;
}

.back-btn {
  background: #444;
  color: #fff;
}

.back-btn:hover {
  background: #555;
}

.signup-btn {
  background: #a387ff;
  color: #fff;
}

.signup-btn:hover {
  background: #8b6fff;
  transform: translateY(-2px);
}

.cancel-btn {
  background: #ff6b6b;
  color: #fff;
}

.cancel-btn:hover {
  background: #ff5252;
}

.organizer-btn {
  background: rgba(255, 182, 193, 0.1);
  color: #ffb6c1;
  border: 2px solid #ffb6c1;
}

.organizer-btn:hover {
  background: rgba(255, 182, 193, 0.2);
  border-color: #ffc0cb;
  color: #ffc0cb;
  transform: translateY(-2px);
}

.force-cancel-btn {
  background: #d32f2f;
  color: white;
}

.force-cancel-btn:hover {
  background: #c62828;
}

.share-container {
  position: relative;
}

.share-btn {
  background: linear-gradient(90deg, #b388ff 60%, #7c7cfb 100%);
  color: white;
  box-shadow: 0 0 12px #b388ff55;
}

.share-btn:hover {
  background: linear-gradient(90deg, #7c7cfb 60%, #b388ff 100%);
  box-shadow: 0 0 18px #b388ff77;
  transform: translateY(-2px);
}

.share-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(179, 136, 255, 0.2);
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 200px;
  animation: fadeIn 0.3s ease-out;
}

/* 修正小箭頭指示器顏色 */
.share-menu::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #1a1a2e; /* 修正為與背景漸層起始顏色一致 */
}

.share-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.8rem 1rem;
  background: none;
  border: none;
  color: #f3f3fa;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap; /* 防止文字換行 */
}

.share-option:hover {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
  transform: translateX(4px); /* 添加輕微的滑動效果 */
}

.share-option i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0; /* 防止圖標被壓縮 */
}

/* 成功狀態樣式 */
.success-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(10px);
  margin: 1rem 0;
  animation: fadeIn 0.5s ease-out;
}

.success-icon {
  font-size: 3rem;
  animation: bounce 2s infinite;
}

.success-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.success-text p {
  margin: 0.3rem 0;
  font-size: 1rem;
  opacity: 0.9;
}

.event-info {
  font-size: 0.9rem !important;
  opacity: 0.8 !important;
  font-style: italic;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .btn-row {
    gap: 0.6rem;
    row-gap: 0.6rem;
  }

  .back-btn,
  .signup-btn,
  .cancel-btn,
  .organizer-btn,
  .force-cancel-btn,
  .share-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    min-width: 90px;
  }

  .share-menu {
    bottom: auto;
    top: 100%;
    left: 0;
    right: 0;
    transform: none;
    margin: 0.5rem 1rem 0 1rem;
  }

  .share-menu::after {
    display: none; /* 在手機版隱藏箭頭 */
  }

  .success-status {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .success-icon {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .btn-row {
    gap: 0.5rem;
    row-gap: 0.5rem;
  }

  .back-btn,
  .signup-btn,
  .cancel-btn,
  .organizer-btn,
  .force-cancel-btn,
  .share-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
    min-width: 80px;
  }
}

/* 主辦人標籤樣式 */
.organizer-badge {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 182, 193, 0.1);
  color: #ffb6c1;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(255, 182, 193, 0.3);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.badge-text {
  font-weight: 600;
}

.event-detail {
  position: relative;
  max-width: 600px;
  margin: 6rem auto 2rem auto;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 0 25px #a387ff44, 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 2.5rem 2rem;
  color: #fff;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
  border: 1px solid rgba(163, 135, 255, 0.1);
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 付款倒數視窗樣式 - 右上角固定 */
.payment-countdown-toast {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 280px; /* 從 350px 縮小到 280px */
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(163, 135, 255, 0.3);
  z-index: 99999;
  animation: slideInFromRight 0.3s ease-out;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.payment-countdown-toast::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #a387ff, #7c7cfb, #a387ff);
  animation: shimmer 2s infinite;
}

.countdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem 0.4rem 1.2rem; /* 縮小內邊距 */
  border-bottom: 1px solid rgba(163, 135, 255, 0.2);
}

.countdown-header h3 {
  color: #a387ff;
  font-size: 1.1rem; /* 從 1.2rem 縮小到 1.1rem */
  margin: 0;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(163, 135, 255, 0.5);
}

.close-countdown-btn {
  background: none;
  border: none;
  color: #a387ff;
  font-size: 0.9rem; /* 從 1rem 縮小到 0.9rem */
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-countdown-btn:hover {
  background: rgba(163, 135, 255, 0.1);
  color: #fff;
}

.countdown-content {
  padding: 0.8rem 1.2rem 1.2rem 1.2rem; /* 縮小內邊距 */
}

.countdown-message {
  color: #fff;
  font-size: 0.85rem; /* 從 0.9rem 縮小到 0.85rem */
  margin-bottom: 0.8rem; /* 從 1rem 縮小到 0.8rem */
  line-height: 1.4;
}

.countdown-timer {
  background: rgba(163, 135, 255, 0.1);
  border: 1px solid rgba(163, 135, 255, 0.3);
  border-radius: 8px;
  padding: 0.6rem; /* 從 0.8rem 縮小到 0.6rem */
  margin-bottom: 0.8rem; /* 從 1rem 縮小到 0.8rem */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.timer-icon {
  font-size: 0.9rem; /* 從 1rem 縮小到 0.9rem */
  animation: pulse 1s infinite;
}

.timer-text {
  color: #a387ff;
  font-size: 0.9rem; /* 從 1rem 縮小到 0.9rem */
  font-weight: bold;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
}

.countdown-actions {
  display: flex;
  gap: 0.6rem; /* 從 0.8rem 縮小到 0.6rem */
}

.pay-now-btn {
  flex: 1;
  background: linear-gradient(135deg, #a387ff 0%, #7c7cfb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.8rem; /* 從 0.6rem 1rem 縮小到 0.5rem 0.8rem */
  font-size: 0.85rem; /* 從 0.9rem 縮小到 0.85rem */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(163, 135, 255, 0.3);
}

.pay-now-btn:hover {
  background: linear-gradient(135deg, #7c7cfb 0%, #a387ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(163, 135, 255, 0.4);
}

.cancel-reg-btn {
  flex: 1;
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 0.5rem 0.8rem; /* 從 0.6rem 1rem 縮小到 0.5rem 0.8rem */
  font-size: 0.85rem; /* 從 0.9rem 縮小到 0.85rem */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-reg-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
  transform: translateY(-1px);
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 響應式設計 */
@media (max-width: 480px) {
  .payment-countdown-toast {
    top: 80px;
    right: 10px;
    left: 10px;
    width: auto;
  }

  .countdown-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* 付款模態視窗樣式 */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.payment-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  border: 2px solid rgba(163, 135, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

.payment-modal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #a387ff, #7c7cfb, #a387ff);
  animation: shimmer 2s infinite;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(163, 135, 255, 0.2);
}

.payment-header h3 {
  color: #a387ff;
  font-size: 1.5rem;
  margin: 0;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(163, 135, 255, 0.5);
}

.close-btn {
  background: none;
  border: none;
  color: #a387ff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(163, 135, 255, 0.1);
  color: #fff;
}

.payment-content {
  margin-bottom: 2rem;
}

.event-summary {
  background: rgba(163, 135, 255, 0.1);
  border: 1px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.event-summary h4 {
  color: #fff;
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  font-weight: bold;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: #ccc;
  font-size: 0.9rem;
}

.payment-methods {
  margin-bottom: 1.5rem;
}

.payment-methods h4 {
  color: #a387ff;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: bold;
}

.method-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(163, 135, 255, 0.1) 0%,
    rgba(124, 124, 251, 0.1) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.method-option::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(163, 135, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.method-option:hover::before {
  left: 100%;
}

.method-option:hover {
  background: linear-gradient(
    135deg,
    rgba(163, 135, 255, 0.2) 0%,
    rgba(124, 124, 251, 0.2) 100%
  );
  border-color: rgba(163, 135, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(163, 135, 255, 0.2);
}

.method-option input[type="radio"] {
  accent-color: #a387ff;
  transform: scale(1.2);
}

.method-option span {
  color: #fff;
  font-weight: 500;
}

.method-icon {
  font-size: 1.3rem;
  color: #a387ff;
  text-shadow: 0 0 10px rgba(163, 135, 255, 0.5);
}

.payment-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
    135deg,
    rgba(163, 135, 255, 0.15) 0%,
    rgba(124, 124, 251, 0.15) 100%
  );
  border: 2px solid rgba(163, 135, 255, 0.4);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  position: relative;
  overflow: hidden;
}

.payment-total::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(163, 135, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shimmer 3s infinite;
}

.payment-total span:first-child {
  color: #fff;
}

.total-amount {
  color: #a387ff;
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(163, 135, 255, 0.5);
}

.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 調整按鈕位置：確認付款在左邊，取消在右邊 */
.payment-actions .confirm-btn {
  background: linear-gradient(135deg, #a387ff 0%, #7c7cfb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(163, 135, 255, 0.3);
  order: 1; /* 確認付款按鈕排在第一位（左邊） */
}

.payment-actions .confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c7cfb 0%, #a387ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(163, 135, 255, 0.4);
}

.payment-actions .confirm-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.payment-actions .cancel-btn {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  order: 2; /* 取消按鈕排在第二位（右邊） */
}

.payment-actions .cancel-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
  transform: translateY(-2px);
}

/* 響應式設計 */
@media (max-width: 480px) {
  .payment-modal {
    margin: 1rem;
    padding: 1.5rem;
  }

  .payment-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .payment-actions .cancel-btn,
  .payment-actions .confirm-btn {
    width: 100%;
    order: unset; /* 手機版恢復正常順序 */
  }
}

.processing-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  animation: pulse 2s infinite;
}

.processing-status .status-msg {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
