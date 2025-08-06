<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const event = ref(null);
const hasSignedUp = ref(false);
const loading = ref(true);

// 檢查會員是否已報名此活動
const checkSignupStatus = async (eventId) => {
  try {
    const memberId = localStorage.getItem("memberId"); // 假設會員ID存在localStorage
    if (!memberId) {
      console.log("未登入會員");
      return;
    }

    const res = await fetch(
      `https://localhost:7181/api/MemberEvent/CheckJoinStatus?eventId=${eventId}&memberId=${memberId}`
    );
    if (res.ok) {
      const data = await res.json();
      hasSignedUp.value = data.isJoined || false;
    }
  } catch (error) {
    console.error("檢查報名狀態失敗:", error);
  }
};

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`https://localhost:7181/api/MemberEvent/${id}`);
    if (res.ok) {
      const data = await res.json();
      // 格式化時間，移除 'T' 字符
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

      // 檢查報名狀態
      await checkSignupStatus(id);
    } else {
      event.value = null;
    }
  } catch (err) {
    event.value = null;
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.back();
}

async function signupOrCancel() {
  if (!event.value) return;

  const memberId = localStorage.getItem("memberId");
  if (!memberId) {
    alert("請先登入會員");
    return;
  }

  const apiRoot = "https://localhost:7181/api/MemberEvent";
  const eventId = event.value.memberEventId;

  /* 判斷是報名還是取消 */
  const isCancel = hasSignedUp.value;
  const url = isCancel
    ? `${apiRoot}/apply?eventId=${eventId}&memberId=${memberId}` // DELETE
    : `${apiRoot}/apply?eventId=${eventId}&memberId=${memberId}`; // POST

  const res = await fetch(url, {
    method: isCancel ? "DELETE" : "POST",
  });

  if (!res.ok) {
    const msg = await res.text(); // 回傳字串就別再 json()
    alert(msg || "操作失敗");
    return;
  }

  /* 依結果更新畫面 */
  if (isCancel) {
    if (event.value.registered > 0) event.value.registered--;
    hasSignedUp.value = false;
    alert("取消報名成功！");
  } else {
    event.value.registered++;
    hasSignedUp.value = true;
    alert("報名成功！");
  }
}
</script>

<template>
  <div class="event-detail" v-if="event">
    <h1>{{ event.title }}</h1>
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

    <!-- 顯示已報名狀態 -->
    <div class="signup-status" v-if="hasSignedUp">
      <p class="status-msg">✅ 您已報名此活動</p>
    </div>

    <div class="btn-row">
      <button class="back-btn" @click="goBack">返回上一頁</button>
      <button
        class="signup-btn"
        :class="{ 'cancel-btn': hasSignedUp }"
        @click="signupOrCancel"
      >
        {{ hasSignedUp ? "取消報名" : "我要報名" }}
      </button>
    </div>
  </div>
  <div v-else-if="loading" class="loading">
    <p>載入中...</p>
  </div>
  <div v-else class="not-found">
    <p>找不到這個活動</p>
  </div>
</template>

<style scoped>
.event-detail {
  max-width: 600px;
  margin: 2rem auto;
  background: #18182c;
  border-radius: 16px;
  box-shadow: 0 0 18px #a387ff33;
  padding: 2.5rem 2rem;
  color: #fff;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
}

h1 {
  color: #a387ff;
  margin-bottom: 1.2rem;
  font-size: 2rem;
  text-align: center;
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

.btn-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.back-btn,
.signup-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
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
}

.cancel-btn:hover {
  background: #ff5252;
}

.signup-status {
  margin-bottom: 1.5rem;
  text-align: center;
}

.status-msg {
  color: #4caf50;
  font-weight: bold;
  padding: 0.5rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid #4caf50;
}

.not-found,
.loading {
  text-align: center;
  margin: 2rem;
  color: #ccc;
}
</style>
