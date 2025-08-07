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
      <div class="row align-items-center">
        <!-- 左側：電影院資訊 -->
        <div class="col-lg-6 col-md-12 mb-4 mb-lg-0">
          <div class="cinema-info">
            <h3 class="fw-bold mb-3 text-gradient fs-2">INFINITY CINEMA</h3>
            <div class="contact-grid">
              <div class="contact-item">
                <i class="bi bi-geo-alt-fill me-2"></i>
                <span>高雄市前鎮區電影路 123 號</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-telephone-fill me-2"></i>
                <span>07-123-4567</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-envelope-fill me-2"></i>
                <span>service@movietheater.tw</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-clock-fill me-2"></i>
                <span>服務時間:10:00 – 23:00</span>
              </div>
            </div>
            <div class="social-links mt-3">
              <a href="https://www.instagram.com/infinitycinemaa_/?igsh=YXAxbjJrNGV0N3Rl&utm_source=qr#" target="_blank" rel="noopener noreferrer" class="social-link me-3">
                <i class="bi bi-instagram ig-gradient fs-4"></i>
              </a>
              <a href="https://www.facebook.com/share/17A9ELkdW6/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="social-link me-3">
                <i class="bi bi-facebook text-primary fs-4"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 右側：觀看人數統計 -->
        <div class="col-lg-6 col-md-12">
          <div class="viewer-stats text-center text-lg-end">
            <div class="stats-card">
              <h4 class="fw-bold mb-3 text-gradient">歷史累計觀看人數</h4>
              <div class="viewer-number">
                <span id="viewerCount" class="display-4 fw-bold text-warning">
                  {{ viewerCount.toLocaleString() }}
                </span>
                <div class="stats-label">人次</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back-to-top 按鈕 -->
      <div class="row mt-4">
        <div class="col-12 text-center">
          <a
            href="#"
            class="back-to-top-btn"
            aria-label="Back to top"
            v-show="showBackTop"
            @click.prevent="scrollTop"
          >
            <i class="bi bi-caret-up-square-fill"></i>
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

/* 漸層文字效果 */
.text-gradient {
  background: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 電影院資訊樣式 */
.cinema-info {
  padding: 1rem;
}

.contact-grid {
  display: grid;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateX(5px);
  border-bottom-color: #fec503;
}

.contact-item i {
  color: #fec503;
  min-width: 20px;
}

/* 社交媒體連結 */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(254, 197, 3, 0.2);
  transform: translateY(-2px);
}

/* 觀看人數統計卡片 */
.viewer-stats {
  padding: 1rem;
}

.stats-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.viewer-number {
  position: relative;
  display: inline-block;
}

.stats-label {
  font-size: 0.9rem;
  color: #adb5bd;
  margin-top: 0.5rem;
}

.stats-description {
  font-style: italic;
}

/* Back-to-top 按鈕 */
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #fec503, #ff6b35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(254, 197, 3, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-to-top-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(254, 197, 3, 0.4);
  color: white;
}

.back-top.show {
  /* 顯示時 */
  opacity: 1;
  pointer-events: auto;
}

.ig-gradient {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .viewer-stats {
    text-align: center !important;
    margin-top: 2rem;
  }
  
  .stats-card {
    padding: 1.5rem;
  }
  
  .contact-grid {
    gap: 0.5rem;
  }
}
</style>
