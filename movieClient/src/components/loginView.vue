<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const message = ref("");
const loading = ref(false);

// 忘記密碼流程
const mode = ref("login"); // login, forgot, reset
const verifyCode = ref("");
const sentCode = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const codeSent = ref(false);

const router = useRouter();

async function login() {
  if (mode.value !== "login") return;
  loading.value = true;
  try {
    console.log("開始登入請求...");
    const res = await fetch("http://localhost:5276/api/Members/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    console.log("API 回應狀態:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("登入失敗:", errorText);
      message.value = "帳號或密碼錯誤";
      return;
    }

    const data = await res.json();
    console.log("登入成功，接收到的資料:", data);

    localStorage.setItem("memberId", data.id);
    localStorage.setItem("token", data.token); // 儲存 JWT Token
    localStorage.setItem("memberName", data.name);
    message.value = `歡迎回來，${data.name}!`;
    router.push("/memberIn");
  } catch (err) {
    console.error("登入過程中發生錯誤:", err);
    message.value = "登入失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}

function goToForgot() {
  mode.value = "forgot";
  message.value = "";
  email.value = "";
  verifyCode.value = "";
  sentCode.value = "";
  codeSent.value = false;
}

async function sendCode() {
  if (!email.value) {
    message.value = "請輸入信箱";
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(
      "http://localhost:5276/api/Members/SendResetCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value,
        }),
      }
    );

    if (!res.ok) {
      let errorMsg = "寄送認證碼失敗";
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // 不是JSON就忽略
      }
      message.value = errorMsg;
      return;
    }

    const data = await res.json();
    codeSent.value = true;
    message.value = data.message || "認證碼已寄出到您的信箱";
  } catch (err) {
    console.error(err);
    message.value = "寄送認證碼失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}

async function verifyResetCode() {
  if (!verifyCode.value) {
    message.value = "請輸入認證碼";
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(
      "http://localhost:5276/api/Members/VerifyResetCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value,
          code: verifyCode.value,
        }),
      }
    );

    if (!res.ok) {
      let errorMsg = "驗證失敗";
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // 不是JSON就忽略
      }
      message.value = errorMsg;
      return;
    }

    const data = await res.json();
    mode.value = "reset";
    message.value = "請輸入新密碼";
  } catch (err) {
    console.error(err);
    message.value = "驗證失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}

async function resetPassword() {
  if (!newPassword.value || !confirmNewPassword.value) {
    message.value = "請輸入新密碼";
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    message.value = "新密碼與確認密碼不一致";
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(
      "http://localhost:5276/api/Members/ResetPassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value,
          newPassword: newPassword.value,
        }),
      }
    );

    if (!res.ok) {
      let errorMsg = "重設密碼失敗";
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // 不是JSON就忽略
      }
      message.value = errorMsg;
      return;
    }

    const data = await res.json();
    message.value = "密碼重設成功，請重新登入";
    setTimeout(() => {
      mode.value = "login";
      email.value = "";
      password.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
      message.value = "";
    }, 1500);
  } catch (err) {
    console.error(err);
    message.value = "重設密碼失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}

function loginWithLine() {
  const clientId = "2007794102";
  const redirectUri = encodeURIComponent(
    "http://localhost:5173/line-callback"
  );
  const state = Math.random().toString(36).substring(2);
  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
  window.location.href = lineAuthUrl;
}

function loginWithGoogle() {
  const clientId =
    "322146887203-gv50tarc1a5t2enjv1of3tpt045u8jj5.apps.googleusercontent.com";
  const redirectUri = encodeURIComponent(
    "http://localhost:5173/google-callback"
  );
  const state = Math.random().toString(36).substring(2);
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20email%20profile&state=${state}`;
  window.location.href = googleAuthUrl;
}

function openYoutube() {
  window.open("https://www.youtube.com/watch?v=vKB2Lg-IM3I", "_blank");
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

  <section class="vh-100 login-section">
    <div class="container-fluid h-custom">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-9 col-lg-6 col-xl-5">
          <img
            src="../images/IMG1123.jpg"
            class="img-fluid"
            alt="logo"
            style="cursor: pointer"
            @click="openYoutube"
          />
        </div>

        <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
          <form @submit.prevent="login">
            <div
              class="d-flex flex-row align-items-center justify-content-center justify-content-lg-start"
            >
              <p class="lead fw-normal mb-0 me-3 fw-bold">會員登入</p>
              <button
                type="button"
                data-mdb-button-init
                data-mdb-ripple-init
                class="btn btn-light btn-floating mx-1"
                @click="loginWithLine"
              >
                <i
                  class="fa-brands fa-line fa-bounce fa-xl"
                  style="color: #3cdd31"
                ></i>
              </button>

              <button class="animated-button" @click="loginWithGoogle">
                <img
                  src="../images/g-logo1.png"
                  alt="Google"
                  style="width: 25px; height: 25px"
                  class="img-bounce"
                />
              </button>
            </div>

            <div class="divider d-flex align-items-center my-4">
              <p class="text-center fw-bold mx-3 mb-0">Or</p>
            </div>

            <!-- Email -->
            <div v-if="mode === 'login'">
              <div class="form-outline mb-4">
                <label class="form-label text-white">Email</label>
                <input
                  v-model="email"
                  type="email"
                  class="form-control form-control-lg"
                  placeholder="輸入電子信箱"
                  @keyup.enter="login"
                />
              </div>
              <!-- Password -->
              <div class="form-outline mb-3">
                <label class="form-label text-white">密碼</label>
                <input
                  v-model="password"
                  type="password"
                  class="form-control form-control-lg"
                  placeholder="輸入密碼"
                  @keyup.enter="login"
                />
                <div class="text-end mt-1 fw-bold">
                  <a
                    href="#"
                    class="small link-danger"
                    @click.prevent="goToForgot"
                    >忘記密碼？</a
                  >
                </div>
              </div>
            </div>

            <!-- 忘記密碼：信箱與認證碼 -->
            <div v-if="mode === 'forgot'">
              <div class="form-outline mb-4">
                <label class="form-label text-white">Email</label>
                <div class="input-group">
                  <input
                    v-model="email"
                    type="email"
                    class="form-control form-control-lg"
                    placeholder="輸入電子信箱"
                  />
                  <button
                    class="btn btn-outline-warning"
                    type="button"
                    @click="sendCode"
                    :disabled="loading || codeSent"
                  >
                    {{ codeSent ? "已寄出" : "寄出認證碼" }}
                  </button>
                </div>
              </div>
              <div class="form-outline mb-4">
                <label class="form-label text-white">認證碼</label>
                <input
                  v-model="verifyCode"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="輸入認證碼"
                />
              </div>
              <div class="text-end mt-1 fw-bold">
                <button
                  class="btn btn-danger"
                  type="button"
                  @click="verifyResetCode"
                >
                  驗證
                </button>
                <a
                  href="#"
                  class="small link-secondary ms-3"
                  @click.prevent="mode = 'login'"
                  >返回登入</a
                >
              </div>
            </div>

            <!-- 重設密碼 -->
            <div v-if="mode === 'reset'">
              <div class="form-outline mb-4">
                <label class="form-label text-white">新密碼</label>
                <input
                  v-model="newPassword"
                  type="password"
                  class="form-control form-control-lg"
                  placeholder="輸入新密碼"
                />
              </div>
              <div class="form-outline mb-4">
                <label class="form-label text-white">確認新密碼</label>
                <input
                  v-model="confirmNewPassword"
                  type="password"
                  class="form-control form-control-lg"
                  placeholder="再次輸入新密碼"
                />
              </div>
              <div class="text-end mt-1 fw-bold">
                <button
                  class="btn btn-danger"
                  type="button"
                  @click="resetPassword"
                >
                  重設密碼
                </button>
                <a
                  href="#"
                  class="small link-secondary ms-3"
                  @click.prevent="mode = 'login'"
                  >返回登入</a
                >
              </div>
            </div>

            <!-- Login button -->
            <div class="text-center text-lg-start mt-4 pt-2">
              <button
                type="button"
                class="btn btn-danger btn-lg"
                @click="login"
                :disabled="loading"
              >
                <span v-if="!loading"> 登入 </span>
              </button>
              <!-- router-link按鈕移除，恢復自動跳轉 -->
              <p class="small fw-bold mt-2 pt-1 mb-0 text-white">
                還沒有帳號?
                <router-link to="/register" class="link-danger"
                  >點此註冊</router-link
                >
              </p>
            </div>

            <!-- 顯示登入訊息 -->
            <p class="mt-3 text-white">{{ message }}</p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css" scoped>
.divider:after,
.divider:before {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}
.h-custom {
  height: calc(100% - 73px);
}
@media (max-width: 450px) {
  .h-custom {
    height: 100%;
  }
}
p {
  color: aliceblue;
}
label {
  color: #eee;
}
img {
  max-width: 100%;
  height: auto;
}
.forgot {
  color: aliceblue;
}

.animated-button {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 52px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.animated-button:hover {
  background-color: #dcdcdc; /* 灰暗效果 */
  transform: scale(1.1);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.img-bounce {
  animation: bounce 0.75s infinite;
}

/* 登入頁面樣式 */
.login-section {
  min-height: 120vh; /* 確保有足夠的滾動空間 */
  padding-bottom: 100px; /* 為footer留出足夠空間 */
}

/* 確保表單容器有足夠的底部空間 */
.container-fluid.h-custom {
  padding-bottom: 60px;
}
</style>

<style lang="css">
.loader {
  font-size: 48px;
  color: #fff;
  display: inline-block;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 400;
  position: relative;
}
.loader:after {
  content: "Loading";
  position: relative;
  z-index: 5;
}
.loader:before {
  content: "";
  height: 6px;
  border: 1px solid;
  border-radius: 10px;
  width: 100%;
  position: absolute;
  bottom: 0px;
  background: linear-gradient(#dbf301 100%, transparent 0) no-repeat;
  background-size: 0% auto;
  animation: 3s lineGrow linear forwards;
}
@keyframes lineGrow {
  to {
    background-size: 100% auto;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
