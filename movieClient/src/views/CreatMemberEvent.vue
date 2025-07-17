<template>
  <div class="create-event">
    <h1>建立揪團活動</h1>
    <form @submit.prevent="submitForm">
      <label>活動標題：</label>
      <input v-model="title" type="text" required />

      <label>選擇電影：</label>
      <select v-model="movieId" required>
        <option disabled value="">請選擇</option>
        <option v-for="movie in movies" :key="movie.id" :value="movie.id">
          {{ movie.name }}
        </option>
      </select>

      <label>開始時間：</label>
      <input v-model="startTime" type="datetime-local" required />

      <label>容納人數：</label>
      <div class="capacity-control">
        <button type="button" @click="decreaseCapacity">-</button>
        <span>{{ maxCapacity }}</span>
        <button type="button" @click="increaseCapacity">+</button>
      </div>

      <label>活動說明：</label>
      <textarea
        v-model="description"
        rows="4"
        placeholder="請輸入說明..."
      ></textarea>

      <button type="submit">送出活動</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const title = ref("");
const movieId = ref("");
const startTime = ref("");
const maxCapacity = ref(30);
const description = ref("");

const movies = ref([
  { id: 1, name: "X 座魔廳看電影" },
  { id: 2, name: "紫幻靈特別場" },
  { id: 3, name: "火影忍者劇場版" },
]); // ⚠️ 未來請改從後端抓取

const increaseCapacity = () => {
  maxCapacity.value++;
};

const decreaseCapacity = () => {
  if (maxCapacity.value > 1) maxCapacity.value--;
};

const submitForm = async () => {
  const deadline = new Date(startTime.value);
  deadline.setDate(deadline.getDate() - 1);

  const newEvent = {
    title: title.value,
    movieId: movieId.value,
    startTime: startTime.value,
    maxCapacity: maxCapacity.value,
    description: description.value,
    updatedAt: deadline.toISOString(), // 作為報名截止時間
  };

  try {
    const res = await fetch("https://localhost:7181/api/MemberEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });

    if (res.ok) {
      alert("✅ 活動建立成功！");
      router.push("/memberEvent");
    } else {
      alert("❌ 建立失敗");
    }
  } catch (err) {
    console.error("錯誤：", err);
  }
};
</script>

<style scoped>
.create-event {
  padding: 2rem;
  max-width: 600px;
  margin: auto;
  background: #1a1a2e;
  border-radius: 12px;
  color: white;
  font-family: "Poppins", "Noto Sans TC", sans-serif;
}

h1 {
  color: #a387ff;
  text-align: center;
  margin-bottom: 1.5rem;
}

form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
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

/* ✅ 修正不能輸入的欄位樣式 */
input[type="text"],
textarea {
  background-color: white;
  color: black;
}

.capacity-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.capacity-control button {
  background-color: #a387ff;
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  transition: 0.3s;
}

.capacity-control button:hover {
  background-color: #7c7cfb;
}

button[type="submit"] {
  width: 100%;
  padding: 0.8rem;
  background-color: #a387ff;
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button[type="submit"]:hover {
  background-color: #7c7cfb;
}

/* 電影選單樣式 */
select {
  background-color: #1a1a2e;
  color: white;
  border: 1px solid #a387ff;
}

option {
  background-color: #1a1a2e;
  color: white;
}
</style>
