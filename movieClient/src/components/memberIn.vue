<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// ❶ 從 localStorage 取登入後的 memberId；測試時先寫死 1
const memberId = localStorage.getItem("memberId") ?? "1";

// ❷ 後端 BaseUrl（正式案建議放 .env，再寫成 import.meta.env.VITE_API_BASEURL）
const apiBase = "https://localhost:7181/api"; // ← 你的 Controller 前面還有 /api

// ❸ 型別宣告
interface memberUpdateDto {
  memberId: number;
  memberName: string;
  memberPhone: string;
  memberGender: boolean;
  memberBirth: string;
  memberEmail: string;
  memberPoint: string; // ← 一定要 string
  memberAddress: string;
  memberImg: string;
  memberBio: string;
}

const member = ref<memberUpdateDto | null>(null);
const error = ref<string | null>(null);
const validateError = ref("");

async function loadMember() {
  try {
    // ❹ 字串要用反引號 `...` 才能插值 ${}
    const res = await fetch(`${apiBase}/Members/${memberId}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`); // ❺ 同樣要用反引號或字串拼接
    }

    const data = (await res.json()) as memberUpdateDto;
    if (data.memberBirth) {
      data.memberBirth = data.memberBirth.slice(0, 10); // 只取 yyyy-MM-dd
    }
    if (!data.memberGender) data.memberGender = true; // 預設男
    if (!data.memberBirth) data.memberBirth = "2000-01-01"; // 預設生日
    if (!data.memberPoint || isNaN(Number(data.memberPoint))) data.memberPoint = "0"; // 預設點數
    if (!data.memberImg) data.memberImg = "/images/posterPicture/default.jpg";
    member.value = data;
  } catch (err) {
    console.error("取會員失敗：", err);
    error.value = "讀取會員資料失敗，請稍後再試";
  }
}

const router = useRouter();
onMounted(() => {
  if (!localStorage.getItem("memberId")) {
    router.push("/memberCenter");
  } else {
    loadMember();
  }
});
import { computed } from "vue";

const birthDate = computed(() => {
  if (!member.value) return "";
  return member.value.memberBirth.slice(0, 10);
});

function logout() {
  localStorage.removeItem("memberId");
  router.push("/memberCenter");
}

function getImgUrl(path: string) {
  if (!path) return "https://via.placeholder.com/120";
  if (path.startsWith("https")) return path;
  return "/" + path.replace(/^\\+|^\/+/, "");
}

function getFullImgUrl(path: string) {
  if (!path) return "https://via.placeholder.com/120";
  // 如果已經是 http 開頭就直接回傳
  if (path.startsWith("https")) return path;
  // 否則加上後端 API 網址
  return "https://localhost:7181" + path;
}

const newImageFile = ref<File | null>(null);
const previewImg = ref<string | null>(null);

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  newImageFile.value = file;
  // 預覽用
  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.value = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("https://localhost:7181/api/Members/Upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data.path; // 這就是 /images/posterPicture/xxx.png
}

async function saveMember() {
  console.log("saveMember 被觸發");
  if (!member.value) return;
  // 必填欄位檢查
  if (
    !member.value.memberImg ||
    !member.value.memberPhone?.trim() ||
    !member.value.memberAddress?.trim() ||
    (member.value.memberGender !== true && member.value.memberGender !== false) ||
    !member.value.memberBirth?.trim()
  ) {
    console.log("必填驗證失敗", member.value);
    validateError.value = "會員照片、電話、地址、性別、生日為必填欄位";
    return;
  }
  validateError.value = "";
  try {
    // 1. 如果有新圖片，先上傳
    if (newImageFile.value) {
      const imgPath = await uploadImage(newImageFile.value);
      member.value.memberImg = imgPath;
      newImageFile.value = null; // 清空暫存
    }
    console.log("即將送出 PUT 請求", member.value);
    // 2. 再送出會員資料
    const res = await fetch(`${apiBase}/Members/${member.value.memberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: member.value.memberId,
        memberName: member.value.memberName,
        memberImg: member.value.memberImg,
        memberPhone: member.value.memberPhone,
        memberGender: member.value.memberGender,
        memberBirth: member.value.memberBirth, // 只送 yyyy-MM-dd
        memberEmail: member.value.memberEmail,
        memberPoint: member.value.memberPoint, // ← 一定要 string
        memberAddress: member.value.memberAddress,
        memberBio: member.value.memberBio,
      }),
    });
    if (!res.ok) throw new Error("更新失敗");
    alert("會員資料已更新！");
  } catch (err) {
    alert("更新失敗，請稍後再試");
  }
}
</script>

<template>
  <div class="container mt-5">
    <!-- 錯誤訊息 -->
    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>
    <div v-if="validateError" class="alert alert-warning text-center">{{ validateError }}</div>

    <!-- 會員資料 -->
    <div v-if="member" class="card mb-4">
      <div
        class="d-flex justify-content-between align-items-center card-header text-white"
        style="background: linear-gradient(to right, #3f51b5, #9c27b0)"
      >
        <span class="fw-bold">會員個人資料</span>
        <button class="btn btn-outline-dark fw-bold" @click="logout">
          登出
        </button>
      </div>
      <div class="card-body">
        <div class="row">
          <div
            class="col-md-3 d-flex flex-column align-items-center justify-content-start"
            style="padding-right: 0"
          >
            <img
              :src="previewImg || getFullImgUrl(member.memberImg)"
              alt="會員照片"
              class="img-thumbnail mb-2"
              style="width: 150px; height: 200px; object-fit: cover"
            />
            <label class="btn btn-secondary mt-2">
              <span class="text-danger">*</span>修改圖片 
              <input
                type="file"
                accept="image/*"
                class="form-control"
                style="display: none"
                @change="onFileChange"
              />
            </label>
          </div>
          <div class="col-md-9">
            <form @submit.prevent="saveMember">
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end"
                  ><strong>會員ID：</strong></label
                >
                <div class="col-sm-9">
                  <input
                    class="form-control"
                    :value="member.memberId"
                    type="text"
                    disabled
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end"
                  ><strong>姓名：</strong></label
                >
                <div class="col-sm-9">
                  <input
                    v-model="member.memberName"
                    class="form-control"
                    type="text"
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end">
                  <span class="text-danger">*</span><strong>電話：</strong>
                </label>
                <div class="col-sm-9">
                  <input
                    v-model="member.memberPhone"
                    class="form-control"
                    type="text"
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end">
                  <span class="text-danger">*</span><strong>性別：</strong>
                </label>
                <div class="col-sm-9">
                  <select v-model="member.memberGender" class="form-control">
                    <option :value="true">男</option>
                    <option :value="false">女</option>
                  </select>
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end">
                  <span class="text-danger">*</span><strong>地址：</strong>
                </label>
                <div class="col-sm-9">
                  <input
                    v-model="member.memberAddress"
                    class="form-control"
                    type="text"
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end">
                  <span class="text-danger">*</span><strong>生日：</strong>
                </label>
                <div class="col-sm-9">
                  <input
                    v-model="member.memberBirth"
                    class="form-control"
                    type="date"
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end"
                  ><strong>Email：</strong></label
                >
                <div class="col-sm-9">
                  <input
                    v-model="member.memberEmail"
                    class="form-control"
                    type="email"
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end"
                  ><strong>點數：</strong></label
                >
                <div class="col-sm-9">
                  <input
                    class="form-control"
                    :value="member.memberPoint"
                    type="text"
                    disabled
                  />
                </div>
              </div>
              <div class="row mb-2 align-items-start">
                <label class="col-sm-3 col-form-label text-end"
                  ><strong>個人介紹：</strong></label
                >
                <div class="col-sm-9">
                  <textarea
                    v-model="member.memberBio"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-9 offset-sm-3">
                  <button class="btn btn-primary mt-2" type="submit">
                    儲存
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 點數區塊 -->
    <div v-if="member" class="alert alert-secondary text-center">
      目前可用點數：<strong>{{ member.memberPoint }}</strong> 點
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>
