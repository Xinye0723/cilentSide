<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

// 會員資料
const memberName = ref("");
const memberImg = ref("");
const previewImg = ref("");
const memberPhone = ref("");
const memberPassword = ref("");
const confirmPassword = ref("");
const memberBirth = ref("");
const memberGender = ref("");
const memberEmail = ref("");
const memberBio = ref("");
const memberAddress = ref("");

const message = ref("");
const loading = ref(false);

// 性別選項
const genderOptions = [
  { value: "true", label: "男" },
  { value: "false", label: "女" }
];

async function handleImgUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  // 預覽
  previewImg.value = URL.createObjectURL(file);
  // 上傳
  const formData = new FormData();
  formData.append("File", file);
  try {
    const res = await fetch("https://localhost:7181/api/Members/Upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      message.value = "圖片上傳失敗";
      return;
    }
    const data = await res.json();
    memberImg.value = data.path; // 儲存圖片路徑
  } catch (err) {
    message.value = "圖片上傳失敗";
  }
}

async function register() {
  // 驗證密碼
  if (memberPassword.value !== confirmPassword.value) {
    message.value = "密碼確認不一致";
    return;
  }

  // 驗證必填欄位（包含大頭照）
  if (!memberImg.value || !memberName.value || !memberPhone.value || !memberPassword.value || 
      !memberBirth.value || !memberGender.value || !memberEmail.value || !memberAddress.value) {
    message.value = "請填寫所有必填欄位（包含大頭照）";
    return;
  }

  loading.value = true;
  try {
    const res = await fetch("https://localhost:7181/api/Members/Register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        MemberName: memberName.value,
        MemberImg: memberImg.value || "",
        MemberPhone: memberPhone.value,
        MemberPassword: memberPassword.value,
        MemberBirth: new Date(memberBirth.value).toISOString(),
        MemberGender: memberGender.value === "true",
        MemberEmail: memberEmail.value,
        MemberBio: memberBio.value || null,
        MemberAddress: memberAddress.value
      }),
    });

    if (!res.ok) {
      let errorMsg = "註冊失敗，請稍後再試";
      try {
        const errorData = await res.json();
        console.error("註冊錯誤回應:", errorData);
        if (typeof errorData === 'object') {
          errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
        } else {
          errorMsg = errorData.toString();
        }
      } catch (e) {
        console.error("解析錯誤回應失敗:", e);
        // 如果無法解析JSON，嘗試讀取純文字
        try {
          const textError = await res.text();
          errorMsg = textError || errorMsg;
        } catch (textError) {
          console.error("讀取錯誤文字失敗:", textError);
        }
      }
      message.value = errorMsg;
      return;
    }

    const data = await res.json();
    
    // 如果後端返回了登入資訊（token等），直接登入
    if (data.token && data.memberId) {
      // 自動登入
      auth.setAuth({
        id: data.memberId.toString(),
        token: data.token,
        name: data.memberName
      });
      
      message.value = `註冊成功！歡迎 ${data.memberName}，正在為您登入...`;
      
      // 延遲跳轉到首頁
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } else {
      // 如果後端沒有返回登入資訊，顯示成功訊息後跳轉到登入頁
      message.value = `註冊成功！歡迎 ${data.memberName}，請登入您的帳號`;
      
      // 延遲跳轉到登入頁面
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  } catch (err) {
    console.error(err);
    message.value = "註冊失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
  />

  <!-- loading 遮罩 -->
  <div v-if="loading" class="loading-overlay">
    <span class="loader"></span>
  </div>

  <section class=" register-section">
    <div class="container-fluid h-custom">
      <div class="row d-flex justify-content-center align-items-center ">
        <div class="col-12 col-md-9 col-lg-6 col-xl-5">
          <img src="../images/LOGO1.png" class="img-fluid" alt="logo" />
        </div>

        <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
          <form @submit.prevent="register">
            <div class="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
              <p class="lead fw-normal mb-0 me-3 text-white fw-bold">會員註冊</p>
            </div>

            <div class="divider d-flex align-items-center my-4">
              <p class="text-center fw-bold  mb-0 text-white">填寫會員資料</p>
            </div>

            <!-- 新增大頭貼上傳欄位 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">大頭貼照片 <span class="text-danger">*</span></label>
              <input type="file" accept="image/*" class="form-control" @change="handleImgUpload" required />
              <div v-if="previewImg" class="mt-2">
                <img :src="previewImg" alt="預覽" style="max-width: 180px; max-height: 120px; border-radius: 8px; border: 1px solid #eee; object-fit: cover;" />
              </div>
            </div>

            <!-- 姓名 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">姓名 <span class="text-danger">*</span></label>
              <input
                v-model="memberName"
                type="text"
                class="form-control form-control-lg"
                placeholder="輸入姓名"
                required
              />
            </div>

            <!-- 電話 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">電話 <span class="text-danger">*</span></label>
              <input
                v-model="memberPhone"
                type="tel"
                class="form-control form-control-lg"
                placeholder="輸入電話號碼"
                required
              />
            </div>

            <!-- Email -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">Email <span class="text-danger">*</span></label>
              <input
                v-model="memberEmail"
                type="email"
                class="form-control form-control-lg"
                placeholder="輸入電子信箱"
                required
              />
            </div>

            <!-- 密碼 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">密碼 <span class="text-danger">*</span></label>
              <input
                v-model="memberPassword"
                type="password"
                class="form-control form-control-lg"
                placeholder="輸入密碼"
                required
              />
            </div>

            <!-- 確認密碼 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">確認密碼 <span class="text-danger">*</span></label>
              <input
                v-model="confirmPassword"
                type="password"
                class="form-control form-control-lg"
                placeholder="再次輸入密碼"
                required
              />
            </div>

            <!-- 生日 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">生日 <span class="text-danger">*</span></label>
              <input
                v-model="memberBirth"
                type="date"
                class="form-control form-control-lg"
                required
              />
            </div>

            <!-- 性別 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">性別 <span class="text-danger">*</span></label>
              <select
                v-model="memberGender"
                class="form-control form-control-lg"
                required
              >
                <option value="">請選擇性別</option>
                <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- 地址 -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">地址 <span class="text-danger">*</span></label>
              <input
                v-model="memberAddress"
                type="text"
                class="form-control form-control-lg"
                placeholder="輸入地址"
                required
              />
            </div>

            <!-- 個人簡介 (可選) -->
            <div class="form-outline mb-3">
              <label class="form-label text-white">個人簡介</label>
              <textarea
                v-model="memberBio"
                class="form-control form-control-lg"
                placeholder="輸入個人簡介 (可選)"
                rows="3"
              ></textarea>
            </div>

            <!-- 註冊按鈕 -->
            <div class="text-center text-lg-start mt-4 pt-2">
              <button
                type="submit"
                class="btn btn-danger btn-lg"
                :disabled="loading"
              >
                <span v-if="!loading">註冊</span>
                <span v-else>註冊中...</span>
              </button>
              
              <p class="small fw-bold mt-2 pt-1 mb-0 text-white">
                已有帳號? <a href="#" @click.prevent="goToLogin" class="link-danger">點此登入</a>
              </p>
            </div>

            <!-- 顯示訊息 -->
            <p class="mt-3 text-white">{{ message }}</p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css" scoped>

</style>

