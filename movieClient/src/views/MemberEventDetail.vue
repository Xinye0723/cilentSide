<template>
  <div v-if="event && event.title" class="event-detail">
    <h1 class="title">{{ event.title }}</h1>

    <div class="info">
      <p>
        <i class="fa fa-calendar"></i> 日期：{{ formatDate(event.startTime) }}
      </p>
      <p><i class="fa fa-clock"></i> 時間：{{ formatTime(event.startTime) }}</p>
      <p>
        <i class="fa fa-map-marker"></i> 地點：影廳 {{ event.theaterNumber }} 號
      </p>
      <p>
        <i class="fa fa-user-friends"></i> 已報名人數：{{ event.registered }} /
        {{ event.maxCapacity }} 人
      </p>
    </div>

    <div class="actions">
      <button
        class="register-btn"
        @click="register"
        :disabled="isRegistered || event.registered >= event.maxCapacity"
      >
        {{ isRegistered ? "已報名" : "我要報名" }}
      </button>

      <button
        class="cancel-btn"
        @click="cancelRegister"
        :disabled="!isRegistered"
      >
        取消報名
      </button>
      <button class="back-btn" @click="goBack">返回上一頁</button>
    </div>
  </div>

  <div v-else class="event-detail event-error">
    <h2 class="error-title">❌ 活動資料載入失敗或不存在</h2>
    <button class="back-btn" @click="goBack">返回上一頁</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const event = ref({});
const isRegistered = ref(false);

onMounted(async () => {
  const id = route.params.id;
  try {
    const memberId = 1; // ⚠️ 暫時寫死，等串會員系統可改成登入者 ID
    const res = await fetch(
      `https://localhost:7181/api/MemberEvent/WithMember?id=${id}&memberId=${memberId}`
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    console.log("✅ 抓到活動資料", data);
    event.value = data;
    isRegistered.value = data.isRegistered; // 如果後端有回傳這個欄位
  } catch (err) {
    console.error("❌ 抓資料錯誤", err);
  }
});

const formatDate = (datetime) => {
  if (!datetime) return "";
  return new Date(datetime).toLocaleDateString("zh-TW");
};

const formatTime = (datetime) => {
  if (!datetime) return "";
  return new Date(datetime).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const goBack = () => {
  router.push("/memberEvent");
};

const register = () => {
  if (isRegistered.value) {
    alert("⚠️ 你已報名過了！");
    return;
  }

  if (event.value.registered >= event.value.maxCapacity) {
    alert("已達報名上限！");
    return;
  }

  alert("報名成功！期待與你一同觀影 🍿");
  event.value.registered++;
  isRegistered.value = true;
};

const cancelRegister = () => {
  if (!isRegistered.value) return;

  const confirmCancel = confirm("確定要取消報名嗎？");
  if (confirmCancel) {
    alert("取消成功");
    event.value.registered--;
    isRegistered.value = false;
  }
};
</script>

<style scoped>
/* 🎨（保留你的原樣式） */
.event-detail {
  padding: 3rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a23, #141433);
  color: white;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
}

.title {
  font-size: 2.5rem;
  color: #a387ff;
  text-shadow: 0 0 10px #a387ff;
  margin-bottom: 2rem;
  animation: flicker 2s infinite;
}

.info p {
  font-size: 1.2rem;
  margin: 1rem 0;
  color: #ccc;
}

.info i {
  margin-right: 0.5rem;
  color: #ff99cc;
}

.actions {
  margin-top: 2.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.register-btn,
.cancel-btn,
.back-btn {
  background: transparent;
  border: 1px solid #a387ff;
  color: #a387ff;
  padding: 0.6rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 8px #7c7cfb;
}

.register-btn:hover {
  background-color: #66d9ff;
  color: #000;
  box-shadow: 0 0 16px #66d9ff;
}

.cancel-btn:hover {
  background-color: #ff9999;
  color: #000;
  box-shadow: 0 0 16px #ff9999;
}

.cancel-btn:disabled,
.register-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.back-btn:hover {
  background-color: #a387ff;
  color: #000;
  box-shadow: 0 0 16px #a387ff;
}

.event-error button {
  margin-top: 1rem;
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 10px #a387ff;
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 6px #7c7cfb;
  }
}
</style>
