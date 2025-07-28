<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const event = ref(null);
const hasSignedUp = ref(false);

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:7181/api/MemberEvent/${id}`);
    if (res.ok) {
      event.value = await res.json();
    } else {
      event.value = null;
    }
  } catch (err) {
    event.value = null;
  }
});

function goBack() {
  router.back();
}

function signupOrCancel() {
  if (!event.value) return;
  if (!hasSignedUp.value) {
    event.value.registered += 1;
    hasSignedUp.value = true;
  } else {
    // 不能小於0
    if (event.value.registered > 0) event.value.registered -= 1;
    hasSignedUp.value = false;
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
    <div class="btn-row">
      <button class="back-btn" @click="goBack">返回上一頁</button>
      <button class="signup-btn" @click="signupOrCancel">
        {{ hasSignedUp ? "取消報名" : "我要報名" }}
      </button>
    </div>
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
  margin-bottom: 1.5rem;
  text-align: center;
}
.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1.1rem;
}
.info-item {
  background: #23234a;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  display: flex;
  align-items: center;
}
.label {
  color: #a387ff;
  font-weight: bold;
  margin-right: 0.5rem;
}
.btn-row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}
.back-btn,
.signup-btn {
  background: #a387ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover,
.signup-btn:hover {
  background: #7e5de4;
}
.signup-msg {
  margin-top: 1.2rem;
  color: #66ff99;
  text-align: center;
  font-size: 1.1rem;
}
.not-found {
  text-align: center;
  color: #ff7b7b;
  margin-top: 3rem;
  font-size: 1.3rem;
}
</style>
