<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import Swal from "sweetalert2";

const auth = useAuthStore();
const { token, memberId: currentMemberId } = storeToRefs(auth);
const isLoggedIn = computed(() => (auth as any).isLoggedIn);
const router = useRouter();

// ❶ 從 auth store 取登入後的 memberId
let memberId = currentMemberId.value ?? "1";

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
    console.log("開始載入會員資料...");
    console.log("會員ID:", memberId);
    console.log("API Base:", apiBase);
    
    // 檢查會員ID是否有效
    if (!memberId || memberId === "1") {
      console.warn("會員ID無效，檢查登入狀態");
      if (!isLoggedIn.value) {
        error.value = "未找到會員資訊，請重新登入";
        router.push("/login");
        return;
      }
      memberId = currentMemberId.value;
    }

    // 先嘗試不需要認證的 API
    console.log("嘗試調用不需要認證的 API...");
    const authToken = token.value;
    const res = await fetch(`${apiBase}/Members/public/${memberId}`, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("API 回應狀態:", res.status);
    console.log("API 回應 URL:", res.url);

    if (!res.ok) {
      console.error("API 回應錯誤:", res.status, res.statusText);
      
      // 如果 public API 失敗，嘗試需要認證的 API
      if (authToken) {
        console.log("嘗試調用需要認證的 API...");
        const authRes = await fetch(`${apiBase}/Members/${memberId}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        console.log("認證 API 回應狀態:", authRes.status);

        if (!authRes.ok) {
                  if (authRes.status === 401) {
          error.value = "登入已過期，請重新登入";
          (auth as any).logout();
          router.push("/login");
          return;
          } else {
            throw new Error(`HTTP ${authRes.status}`);
          }
        }

        const data = (await authRes.json()) as memberUpdateDto;
        processMemberData(data);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } else {
      const data = (await res.json()) as memberUpdateDto;
      processMemberData(data);
    }
  } catch (err) {
    console.error("取會員失敗：", err);
    if (err.message?.includes('401')) {
      error.value = "登入已過期，請重新登入";
      (auth as any).logout();
      router.push("/login");
    } else {
      error.value = "讀取會員資料失敗，請稍後再試";
    }
  }
}

// 處理會員資料的輔助函數
function processMemberData(data: memberUpdateDto) {
  if (data.memberBirth) {
    data.memberBirth = data.memberBirth.slice(0, 10); // 只取 yyyy-MM-dd
  }
  if (!data.memberGender) data.memberGender = true; // 預設男
  if (!data.memberBirth) data.memberBirth = "2000-01-01"; // 預設生日
  if (!data.memberPoint || isNaN(Number(data.memberPoint))) data.memberPoint = "0"; // 預設點數
  if (!data.memberImg) data.memberImg = "/images/posterPicture/default.jpg";
  member.value = data;
  console.log("會員資料載入成功:", data);
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.push("/memberCenter");
  } else {
    loadMember();
  }
});

const birthDate = computed(() => {
  if (!member.value) return "";
  return member.value.memberBirth.slice(0, 10);
});



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

// 修改密碼相關變數
const showChangePassword = ref(false);
const newPassword = ref("");
const confirmNewPassword = ref("");
const passwordMessage = ref("");

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
    const authToken = token.value;
    const res = await fetch(`${apiBase}/Members/${member.value.memberId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
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
    if (!res.ok) {
      if (res.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "登入已過期",
          text: "請重新登入",
          confirmButtonText: "確定",
          confirmButtonColor: "#f39c12"
        });
        (auth as any).logout();
        router.push("/login");
        return;
      }
      throw new Error("更新失敗");
    }
    Swal.fire({
      icon: "success",
      title: "更新成功！",
      text: "會員資料已更新",
      confirmButtonText: "確定",
      confirmButtonColor: "#3085d6"
    });
  } catch (err) {
    console.error("更新會員資料失敗：", err);
    Swal.fire({
      icon: "error",
      title: "更新失敗",
      text: "請稍後再試",
      confirmButtonText: "確定",
      confirmButtonColor: "#d33"
    });
  }
}

// 修改密碼相關函數
function toggleChangePassword() {
  showChangePassword.value = !showChangePassword.value;
  if (!showChangePassword.value) {
    // 如果關閉修改密碼模式，清空相關資料
    newPassword.value = "";
    confirmNewPassword.value = "";
    passwordMessage.value = "";
  }
}

async function updatePassword() {
  if (!newPassword.value || !confirmNewPassword.value) {
    passwordMessage.value = "請輸入新密碼";
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    passwordMessage.value = "新密碼與確認密碼不一致";
    return;
  }
  
  try {
    const memberIdValue = currentMemberId.value;
    const authToken = token.value;
    
    const res = await fetch(`https://localhost:7181/api/Members/UpdatePassword/${memberIdValue}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        NewPassword: newPassword.value,
      }),
    });

    if (!res.ok) {
      let errorMsg = "修改密碼失敗";
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // 不是JSON就忽略
      }
      passwordMessage.value = errorMsg;
      return;
    }

    const data = await res.json();
    Swal.fire({
      icon: "success",
      title: "密碼修改成功！",
      text: "您的密碼已成功更新",
      confirmButtonText: "確定",
      confirmButtonColor: "#3085d6"
    }).then(() => {
      showChangePassword.value = false;
      newPassword.value = "";
      confirmNewPassword.value = "";
      passwordMessage.value = "";
    });
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "修改密碼失敗",
      text: "請稍後再試",
      confirmButtonText: "確定",
      confirmButtonColor: "#d33"
    });
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
        class="card-header text-white"
        style="background: linear-gradient(to right, #3f51b5, #9c27b0)"
      >
        <span class="fw-bold">會員個人資料</span>
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
            <!-- 會員資料表單 -->
            <form v-if="!showChangePassword" @submit.prevent="saveMember">
              <div class="row mb-2 align-items-center">
                <label class="col-sm-3 col-form-label text-end text-white"
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
                <label class="col-sm-3 col-form-label text-end text-white"
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
                <label class="col-sm-3 col-form-label text-end text-white">
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
                <label class="col-sm-3 col-form-label text-end text-white">
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
                <label class="col-sm-3 col-form-label text-end text-white">
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
                <label class="col-sm-3 col-form-label text-end text-white">
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
                <label class="col-sm-3 col-form-label text-end text-white"
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
              <div class="row mb-2 align-items-start">
                <label class="col-sm-3 col-form-label text-end text-white"
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
                  <div class="d-flex gap-2 mt-2">
                    <button class="btn btn-warning" type="button" @click="toggleChangePassword">
                      修改密碼
                    </button>
                    <button class="btn btn-primary" type="submit">
                      儲存
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <!-- 修改密碼表單 -->
            <div v-if="showChangePassword">
              <div v-if="passwordMessage" class="alert alert-info text-center mb-3">
                {{ passwordMessage }}
              </div>
              <div class="row mb-3">
                <label class="col-sm-3 col-form-label text-end text-white">
                  <span class="text-danger">*</span><strong>新密碼：</strong>
                </label>
                <div class="col-sm-9">
                  <input
                    v-model="newPassword"
                    type="password"
                    class="form-control"
                    placeholder="輸入新密碼"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label class="col-sm-3 col-form-label text-end text-white">
                  <span class="text-danger">*</span><strong>確認新密碼：</strong>
                </label>
                <div class="col-sm-9">
                  <input
                    v-model="confirmNewPassword"
                    type="password"
                    class="form-control"
                    placeholder="再次輸入新密碼"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-sm-9 offset-sm-3">
                  <div class="d-flex gap-2 mt-2">
                    <button class="btn btn-warning" @click="updatePassword">
                      確定修改
                    </button>
                    <button class="btn btn-secondary" @click="toggleChangePassword">
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background-color: #1a1a1a;
}
</style>
