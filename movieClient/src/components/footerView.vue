<script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";

/* ➊ 是否顯示按鈕 */
const showBackTop = ref(false);

/* ➋ 滑動監聽：超過 多少 才顯示 */
const onScroll = () => {
  showBackTop.value = window.scrollY > 100;
};

/* ➌ 平滑回頂 */
const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  onScroll(); // 進頁面先判斷一次
  window.addEventListener("scroll", onScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <footer id="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-4 footer-column">
          <ul class="nav flex-column">
            <li class="nav-item">
              <span class="footer-title">Product</span>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Product 1</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Product 2</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Plans & Prices</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Frequently asked questions</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="row text-center">
        <div class="col-md-4 box">
          <a
            href="#"
            class="position-fixed bottom-0 end-0 m-4"
            style="font-size: 2.5rem"
            aria-label="Back to top"
            v-show="showBackTop"
            @click.prevent="scrollTop"
            ><i class="bi bi-caret-up-square-fill"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="css" scoped>
  /* 讓按鈕淡入淡出、避免點擊到隱形區域 */
.back-top {
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.back-top[style*="display: none"] {
  /* v-show 還在 DOM，只是 display:none */
  opacity: 0;
}
.back-top[style*="display: inline"] {
  /* v-show 顯示時 */
  opacity: 1;
  pointer-events: auto;
}

/* 其餘原本的 footer 樣式保持不變 ↓ */
a {
  color: #6c757d;
}
a:hover {
  color: #fec503;
  text-decoration: none;
}
a {
  color: #6c757d;
}

a:hover {
  color: #fec503;
  text-decoration: none;
}

::selection {
  background: #fec503;
  text-shadow: none;
}

footer {
  padding: 2rem 0;
  background-color: #212529;
}

.footer-column:not(:first-child) {
  padding-top: 2rem;
}
@media (min-width: 768px) {
  .footer-column:not(:first-child) {
    padding-top: 0rem;
  }
}

.footer-column {
  text-align: center;
}
.footer-column .nav-item .nav-link {
  padding: 0.1rem 0;
}
.footer-column .nav-item span.nav-link {
  color: #6c757d;
}
.footer-column .nav-item span.footer-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
}
.footer-column .nav-item .fas {
  margin-right: 0.5rem;
}
.footer-column ul {
  display: inline-block;
}
@media (min-width: 768px) {
  .footer-column ul {
    text-align: left;
  }
}

ul.social-buttons {
  margin-bottom: 0;
}

ul.social-buttons li a:active,
ul.social-buttons li a:focus,
ul.social-buttons li a:hover {
  background-color: #fec503;
}

ul.social-buttons li a {
  font-size: 20px;
  line-height: 40px;
  display: block;
  width: 40px;
  height: 40px;
  -webkit-transition: all 0.3s;
  -moz-transition: all 0.3s;
  transition: all 0.3s;
  color: #fff;
  border-radius: 100%;
  outline: 0;
  background-color: #1a1d20;
}

footer .quick-links {
  font-size: 90%;
  line-height: 40px;
  margin-bottom: 0;
  text-transform: none;
  font-family: Montserrat, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.copyright {
  color: white;
}

.fa-ellipsis-h {
  color: white;
  padding: 2rem 0;
}
</style>