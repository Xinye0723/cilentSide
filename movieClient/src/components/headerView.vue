<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";

const isMenuOpen = ref(false);
const isScrolled = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.style.overflow = isMenuOpen.value ? "hidden" : "";
}

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 50;
  };
  const onResize = () => {
    if (window.innerWidth > 768 && isMenuOpen.value) toggleMenu();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isMenuOpen.value) toggleMenu();
  };

  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKey);
  onScroll(); // 初始化一次

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKey);
  });
});
const showMovieSubmenu = ref(false);
const showEventSubmenu = ref(false);
function scrollToFooter() {
  // 若側欄打開先關閉
  if (isMenuOpen.value) toggleMenu();

  // 再讓瀏覽器捲到 #footer
  const footer = document.getElementById("footer");
  footer?.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <nav class="navbar fixed-top" :class="{ scrolled: isScrolled }">
    <div class="logo">
      <RouterLink :to="{ name: 'home' }">INFINITE CINEMA</RouterLink>
    </div>
    <div class="navbar-container">
      <button
        class="mobile-nav-toggle"
        :class="{ active: isMenuOpen }"
        aria-label="Toggle navigation"
        @click="toggleMenu"
      >
        <span class="bar" /><span class="bar" /><span class="bar" />
      </button>

      <ul class="nav-links z-50" :class="{ active: isMenuOpen }">
        <li
          class="dropdown"
          @mouseenter="showMovieSubmenu = true"
          @mouseleave="showMovieSubmenu = false"
        >
          <a href="#" @click="toggleMenu">電影介紹</a>
          <ul class="submenu mt-2" v-show="showMovieSubmenu">
            <li>
              <RouterLink :to="{ name: 'onShowMovie' }" @click="toggleMenu"
                >現正熱映</RouterLink
              >
            </li>
            <li>
              <RouterLink :to="{ name: 'comingSonnMovie' }" @click="toggleMenu"
                >即將上映</RouterLink
              >
            </li>
          </ul>
        </li>
        <li>
          <RouterLink :to="{ name: 'ticket' }" @click="toggleMenu"
            >快速訂票</RouterLink
          >
        </li>
        <li
          class="dropdown"
          @mouseenter="showEventSubmenu = true"
          @mouseleave="showEventSubmenu = false"
        >
          <a href="#" @click="toggleMenu">活動公告</a>
          <ul class="submenu mt-2" v-show="showEventSubmenu">
            <li>
              <RouterLink :to="{ name: 'cinemaEvent' }" @click="toggleMenu"
                >影城活動</RouterLink
              >
            </li>
            <li>
              <RouterLink :to="{ name: 'memberEvent' }" @click="toggleMenu"
                >揪團活動</RouterLink
              >
            </li>
          </ul>
        </li>
        <li>
          <RouterLink :to="{ name: 'socialArea' }" @click="toggleMenu"
            >討論區</RouterLink
          >
        </li>
        <li><a href="#footer" @click.prevent="scrollToFooter">聯絡我們</a></li>
        <li>
          <RouterLink :to="{ name: 'memberCenter' }" @click="toggleMenu"
            >會員中心</RouterLink
          >
        </li>
      </ul>
    </div>
  </nav>

  <div class="overlay" :class="{ active: isMenuOpen }" @click="toggleMenu" />
</template>

<style lang="css" scoped>
/* ---------- Reset & 全域 ---------- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

:global(:root) {
  --gradient: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --border: 1px solid rgba(255, 255, 255, 0.1);
  --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

:global(body) {
  background: #0a0a0a;
  min-height: 100vh;
  padding-top: 64px;
}

/* ---------- Navbar ---------- */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.2rem 5%;
  backdrop-filter: blur(12px);
  background: var(--glass-bg);
  border-bottom: var(--border);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow);
}

.navbar.scrolled {
  padding: 0.8rem 5%;
  background: rgba(10, 10, 10, 0.95);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 8s linear infinite;
  background-size: 300%;
  letter-spacing: -0.5px;
  margin-right: auto;
}

/* ---------- Nav Links ---------- */
.nav-links {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  list-style: none;
  align-items: center;
}

/* 共用連結樣式（不再把 active 狀態寫在這裡，避免覆寫子選單 padding） */
.nav-links a,
.nav-links router-link,
.submenu li a,
.submenu li router-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  font-size: 1.05rem;
  letter-spacing: 0.3px;
}

/* 上下漸層底線 */
.nav-links a::before,
.nav-links router-link::before,
.nav-links a::after,
.nav-links router-link::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  background: var(--gradient);
  background-size: 300%;
  transition: width 0.3s ease;
}
.nav-links a::before,
.nav-links router-link::before {
  top: -4px;
  left: 0;
}
.nav-links a::after,
.nav-links router-link::after {
  bottom: -4px;
  right: 0;
}

/* Hover 效果 */
.nav-links a:hover,
.nav-links router-link:hover,
.submenu li a:hover,
.submenu li router-link:hover {
  color: #fff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}
.nav-links a:hover::before,
.nav-links router-link:hover::before,
.nav-links a:hover::after,
.nav-links router-link:hover::after {
  width: 100%;
  animation: gradient 8s linear infinite;
}

/* ---❶ 只給「第一層」的 active 狀態（避免影響子選單） --- */

/* ---❷ 子選單在 active 狀態仍保留原 padding，防止文字左移 --- */
.submenu li a.router-link-active,
.submenu li a.router-link-exact-active {
  padding: 0.75rem 1rem; /* 與 .submenu li a 一致 */
}

/* ---------- Mobile Nav Toggle ---------- */
.mobile-nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  position: relative;
  z-index: 1001;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}
.mobile-nav-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.mobile-nav-toggle .bar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: white;
  transition: all 0.4s ease;
}
.mobile-nav-toggle .bar:nth-child(1) {
  top: 14px;
}
.mobile-nav-toggle .bar:nth-child(2) {
  top: 19px;
}
.mobile-nav-toggle .bar:nth-child(3) {
  top: 24px;
}

/* ---------- Gradient Animation ---------- */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* ---------- Responsive ---------- */
@media (max-width: 768px) {
  .logo {
    margin-right: 0;
  }
  .mobile-nav-toggle {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 80%;
    max-width: 400px;
    background: linear-gradient(
      135deg,
      rgba(10, 10, 10, 0.99),
      rgba(20, 20, 20, 0.99)
    );
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
    padding: 2rem;
    backdrop-filter: blur(10px);
  }
  .nav-links::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03));
    pointer-events: none;
  }
  .nav-links.active {
    right: 0;
  }

  /* 滑入動畫只給第一層 */
  .nav-links > li > a,
  .nav-links > li > router-link {
    font-size: 1.2rem;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.4s ease;
  }
  .nav-links.active > li > a,
  .nav-links.active > li > router-link {
    opacity: 1;
    transform: translateX(0);
  }

  /* 進場延遲 */
  .nav-links > li:nth-child(1) > a,
  .nav-links > li:nth-child(1) > router-link {
    transition-delay: 0.1s;
  }
  .nav-links > li:nth-child(2) > a,
  .nav-links > li:nth-child(2) > router-link {
    transition-delay: 0.2s;
  }
  .nav-links > li:nth-child(3) > a,
  .nav-links > li:nth-child(3) > router-link {
    transition-delay: 0.3s;
  }
  .nav-links > li:nth-child(4) > a,
  .nav-links > li:nth-child(4) > router-link {
    transition-delay: 0.4s;
  }
  .nav-links > li:nth-child(5) > a,
  .nav-links > li:nth-child(5) > router-link {
    transition-delay: 0.5s;
  }

  .mobile-nav-toggle.active .bar:nth-child(1) {
    transform: translate(-50%, 5px) rotate(45deg);
    width: 24px;
  }
  .mobile-nav-toggle.active .bar:nth-child(2) {
    opacity: 0;
  }
  .mobile-nav-toggle.active .bar:nth-child(3) {
    transform: translate(-50%, -5px) rotate(-45deg);
    width: 24px;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    backdrop-filter: blur(4px);
  }
  .overlay.active {
    opacity: 1;
    visibility: visible;
  }
}

/* ---------- Section ---------- */
.section-title {
  font-size: 3rem;
}
.section-description {
  font-size: 1rem;
  padding: 0 1rem;
}

section {
  min-height: 100vh;
  padding: 120px 5% 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}
section:nth-child(even) {
  background: var(--section-bg);
}

.section-content {
  max-width: 1400px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}
.section-title {
  font-size: 8vw;
  font-weight: 800;
  margin-bottom: 2rem;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 8s linear infinite;
  background-size: 300%;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -2px;
}
.section-description {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.8;
  color: white;
}

/* ---------- Dropdown / Submenu ---------- */
.dropdown {
  position: relative;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: black;
  padding: 0;
  margin: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.submenu li a,
.submenu li router-link {
  display: block;
  padding: 0.75rem 1rem;
  white-space: nowrap;
  color: whitesmoke;
  text-decoration: none;
}

/* 子選單 hover 色（需要再開啟） */
/* .submenu li a:hover,
   .submenu li router-link:hover { background-color: #f0f0f0; } */
/* 讓絕對定位的 submenu 不會被裁掉 */
.navbar,
.nav-links,
.dropdown {
  overflow: visible !important;
}

/* 讓 submenu 穩居最上層（高於卡片/overlay） */
.submenu {
  z-index: 2000; /* 比 .navbar 的 1000 再高一層即可 */
}
</style>
