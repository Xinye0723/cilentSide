<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const message = ref("");
const loading = ref(false);

const router = useRouter();

async function login() {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const res = await fetch("https://localhost:7181/api/Members/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    if (!res.ok) {
      message.value = "帳號或密碼錯誤";
      return;
    }

    const data = await res.json();
    localStorage.setItem("memberId", data.id);
    message.value = `歡迎回來，${data.name}!`;
    router.push("/memberIn");
  } catch (err) {
    console.error(err);
    message.value = "登入失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
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

  <section class="vh-100">
    <div class="container-fluid h-custom">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-9 col-lg-6 col-xl-5">
          <img src="../images/LOGO1.png" class="img-fluid" alt="logo" />
        </div>

        <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
          <form @submit.prevent="login">
            <div
              class="d-flex flex-row align-items-center justify-content-center justify-content-lg-start"
            >
              <p class="lead fw-normal mb-0 me-3">會員登入</p>
              <button
                type="button"
                data-mdb-button-init
                data-mdb-ripple-init
                class="btn btn-light btn-floating mx-1"
              >
                <i
                  class="fa-brands fa-line fa-bounce fa-xl"
                  style="color: #3cdd31"
                ></i>
              </button>

              <button class="animated-button">
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
                還沒有帳號? <a href="#!" class="link-danger">點此註冊</a>
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
  transform: scale(1.1);
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
