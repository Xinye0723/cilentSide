<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { CountUp } from "countup.js";

/* ─── ❶ Back-to-top ─── */
const showBackTop = ref(false);
const onScroll = () => (showBackTop.value = window.scrollY > 200);
const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

/* ─── ❷ 累計觀看人數 ─── */
const viewerCount = ref(0);
const targetCount = 12_345_678; // ← 換成後端實際數字

/** 執行一次動畫：先把顯示值歸 0，再跑到 target */
function runCountUp() {
  viewerCount.value = 0;
  const cu = new CountUp("viewerCount", targetCount, {
    duration: 1,
    separator: ",",
    startVal: 0,
  });
  cu.start(() => (viewerCount.value = targetCount));
}

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll);

  /* 觀察 footer 每次進入視窗都重新跑動畫 */
  const footer = document.getElementById("footer");
  if (footer) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) runCountUp();
      },
      { threshold: 0.3 }
    );
    io.observe(footer);
  }
});
// onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <footer id="footer" class="footer-bg text-white py-5">
    <div class="container">
      <!-- 兩欄：左數字、右資訊 -->
      <div class="row align-items-center text-center text-md-start g-4">
        <div class="col-md-6">
          <h4 class="fw-bold mb-2">歷史累計觀看人數</h4>
          <span id="viewerCount" class="display-5 fw-bold">
            {{ viewerCount.toLocaleString() }}
          </span>
        </div>

        <div class="col-md-6 text-center text-md-end">
          <h4 class="fw-bold mb-2">影城資訊</h4>
          <ul class="list-unstyled mb-0 small lh-lg">
            <li>地址：高雄市前鎮區電影路 123 號</li>
            <li>客服電話：07-123-4567</li>
            <li>Email：service@movietheater.tw</li>
            <li>營業時間：10:00 – 23:00</li>
          </ul>
        </div>
      </div>

      <!-- 你的 Back-to-top 版本（保留原結構） -->
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

<style scoped>
.footer-bg {
  background: radial-gradient(ellipse at top left, #343a40 0%, #212529 60%);
}

/* Back-to-top 淡入淡出 */
.back-top {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s;
}
.back-top[style*="display: none"] {
  opacity: 0;
}
.back-top[style*="display: inline"] {
  opacity: 1;
  pointer-events: auto;
}

/* 連結配色 */
a {
  color: #adb5bd;
}
a:hover {
  color: #fec503;
  text-decoration: none;
}
.back-top.show {
  /* 顯示時 */
  opacity: 1;
  pointer-events: auto;
}
</style>
