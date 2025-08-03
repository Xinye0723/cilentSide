<script setup lang="ts">
import { ref, type Ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const showMovieSubmenu = ref(false);
const showEventSubmenu = ref(false);
const showMemberSubmenu = ref(false);

/* ─── ❶ 子選單收合計時器（100 ms） ─── */
const HOVER_DELAY = 100; // ← 想再更短改這裡
const hideTimer: Record<
  "movie" | "event" | "member",
  ReturnType<typeof setTimeout> | null
> = {
  movie: null,
  event: null,
  member: null,
};

/* ─── ❷ 切換漢堡 ─── */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
function toggleMenu() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  isMenuOpen.value = !isMenuOpen.value;
  document.body.style.overflow = isMenuOpen.value ? "hidden" : "";
  debounceTimeout = setTimeout(() => {
    document.body.style.overflow = isMenuOpen.value ? "hidden" : "";
  }, 300);
}

/* ─── ❸ 點選連結 ─── */
function handleLinkClick(to: { name: string }) {
  if (isMenuOpen.value) {
    toggleMenu();
    setTimeout(() => router.push(to), 300);
  } else {
    router.push(to);
  }
}

/* ─── ❹ 監聽滾動 / resize / ESC ─── */
onMounted(() => {
  const onScroll = () => (isScrolled.value = window.scrollY > 50);
  const onResize = () => {
    if (window.innerWidth > 1000 && isMenuOpen.value) {
      isMenuOpen.value = false;
      document.body.style.overflow = "";
    }
  };
  const onKey = (e: KeyboardEvent) =>
    e.key === "Escape" && isMenuOpen.value && toggleMenu();

  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKey);
  onScroll();

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKey);
    document.body.style.overflow = "";
    if (debounceTimeout) clearTimeout(debounceTimeout);
  });
});

/* ─── ❺ 捲到 footer ─── */
function scrollToFooter() {
  if (isMenuOpen.value) toggleMenu();
  document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
}
const submenuFlags = {
  movie: showMovieSubmenu,
  event: showEventSubmenu,
  member: showMemberSubmenu,
} as const;
/* ─── ❻ 工具函式：處理延遲收起 ─── */
function enterMenu(which: keyof typeof submenuFlags) {
  clearTimeout(hideTimer[which]!);
  submenuFlags[which].value = true;
}
function leaveMenu(which: keyof typeof submenuFlags) {
  hideTimer[which] = setTimeout(
    () => (submenuFlags[which].value = false),
    HOVER_DELAY
  );
}
</script>

<template>
  <nav class="navbar fixed-top" :class="{ scrolled: isScrolled }">
    <div class="logo pe-12">
      <RouterLink :to="{ name: 'home' }" class="pe-8"
        >INFINITY CINEMA</RouterLink
      >
    </div>

    <div class="navbar-container">
      <!-- 漢堡 -->
      <button
        class="mobile-nav-toggle"
        :class="{ active: isMenuOpen }"
        aria-label="Toggle navigation"
        @click="toggleMenu"
      >
        <span class="bar" /><span class="bar" /><span class="bar" />
      </button>

      <!-- 主選單 -->
      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <!-- 電影 -->
        <li
          class="dropdown"
          @mouseenter="enterMenu('movie')"
          @mouseleave="leaveMenu('movie')"
        >
          <RouterLink
            :to="{ name: 'movie' }"
            @click.prevent="handleLinkClick({ name: 'movie' })"
            ><i class="bi bi-camera-reels me-1"></i>電影清單</RouterLink
          >
          <ul class="submenu" v-show="showMovieSubmenu">
            <li>
              <RouterLink
                :to="{ name: 'onShowMovie' }"
                @click.prevent="handleLinkClick({ name: 'onShowMovie' })"
                >現正熱映</RouterLink
              >
            </li>
            <li>
              <RouterLink
                :to="{ name: 'comingSoonMovie' }"
                @click.prevent="handleLinkClick({ name: 'comingSoonMovie' })"
                >即將上映</RouterLink
              >
            </li>
            <li>
              <RouterLink
                :to="{ name: 'movieReview' }"
                @click.prevent="handleLinkClick({ name: 'movieReview' })"
                >所有評論</RouterLink
              >
            </li>
          </ul>
        </li>

        <!-- 快速訂票 -->
        <li>
          <RouterLink
            :to="{ name: 'ticket' }"
            @click.prevent="handleLinkClick({ name: 'ticket' })"
            ><i class="bi bi-ticket-perforated me-1"></i>快速訂票</RouterLink
          >
        </li>

        <!-- 活動 -->
        <li
          class="dropdown"
          @mouseenter="enterMenu('event')"
          @mouseleave="leaveMenu('event')"
        >
          <RouterLink
            :to="{ name: 'event' }"
            @click.prevent="handleLinkClick({ name: 'event' })"
            ><i class="bi bi-calendar2-event me-1"></i>活動公告</RouterLink
          >
          <ul class="submenu" v-show="showEventSubmenu">
            <li>
              <RouterLink
                :to="{ name: 'cinemaEvent' }"
                @click.prevent="handleLinkClick({ name: 'cinemaEvent' })"
                >影城活動</RouterLink
              >
            </li>
            <li>
              <RouterLink
                :to="{ name: 'memberEvent' }"
                @click.prevent="handleLinkClick({ name: 'memberEvent' })"
                >揪團活動</RouterLink
              >
            </li>
          </ul>
        </li>

        <!-- 討論區 -->
        <li>
          <RouterLink
            :to="{ name: 'socialArea' }"
            @click.prevent="handleLinkClick({ name: 'chat' })"
            >討論區</RouterLink
          >
        </li>

        <!-- 聯絡我們 -->
        <li><a href="#footer" @click.prevent="scrollToFooter">聯絡我們</a></li>

        <!-- 會員 -->
        <li
          class="dropdown"
          @mouseenter="enterMenu('member')"
          @mouseleave="leaveMenu('member')"
        >
          <RouterLink
            :to="{ name: 'memberIn' }"
            @click.prevent="handleLinkClick({ name: 'memberIn' })"
            ><i class="bi bi-person-circle me-1"></i>會員中心</RouterLink
          >
          <ul class="submenu" v-show="showMemberSubmenu">
            <li>
              <RouterLink
                :to="{ name: 'memberInform' }"
                @click.prevent="handleLinkClick({ name: 'memberInform' })"
                >會員資料</RouterLink
              >
            </li>
            <li>
              <RouterLink
                :to="{ name: 'memberIn' }"
                @click.prevent="handleLinkClick({ name: 'memberIn' })"
                >修改資料</RouterLink
              >
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>

  <!-- 抽屜背景 -->
  <div class="overlay" :class="{ active: isMenuOpen }" @click="toggleMenu" />
</template>

<style lang="css" scoped>
/* -------- 變數 -------- */
:global(:root) {
  --gradient: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --border: 1px solid rgba(255, 255, 255, 0.1);
  --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --drawer-w: 80%; /* ← 想再窄改這裡 */
}

/* -------- Reset -------- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
:global(body) {
  background: #0a0a0a;
  min-height: 100vh;
  padding-top: 64px;
}

/* -------- Navbar -------- */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem 5%;
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

/* -------- Logo -------- */
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

/* -------- Nav Links -------- */
.nav-links {
  display: flex;
  gap: 2.5rem;
  flex-wrap: nowrap;
  white-space: nowrap;
  margin-left: clamp(4rem, 18vw, 500px);
  list-style: none;
}
.nav-links a,
.submenu li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  font-size: 1.05rem;
}
/* 上下漸層底線 */
.nav-links a::before,
.nav-links a::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  background: var(--gradient);
  background-size: 300%;
  transition: width 0.3s ease;
}
.nav-links a::before {
  top: -4px;
  left: 0;
}
.nav-links a::after {
  bottom: -4px;
  right: 0;
}
.nav-links a:hover,
.submenu li a:hover {
  color: #fff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}
.nav-links a:hover::before,
.nav-links a:hover::after {
  width: 100%;
  animation: gradient 8s linear infinite;
}

/* -------- Dropdown -------- */
.dropdown {
  position: relative;
}
.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: black;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2000;
}
.submenu li a {
  display: block;
  padding: 0.75rem 1rem;
  white-space: nowrap;
}

/* -------- Mobile Toggle -------- */
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
  margin-left: auto;
  position: absolute; /* ←NEW */
  right: 2rem; /* ←NEW：離右邊 2rem（跟 Navbar padding 對齊）*/
  top: 50%; /* ←NEW */
  transform: translateY(-50%); /* ←NEW：垂直置中 */
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

/* -------- Hamburger Drawer (≤1000px) -------- */
@media (max-width: 1000px) {
  .mobile-nav-toggle {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: var(--drawer-w);
    max-width: 400px;
    background: linear-gradient(
      135deg,
      rgba(10, 10, 10, 0.99),
      rgba(20, 20, 20, 0.99)
    );
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 3rem 2rem;
    gap: 2rem;
    transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    align-items: center; /* ← 原本 flex-start */
    text-align: center; /* ← NEW：錨點置中 */
    width: 300px;
  }
  .nav-links.active {
    right: 0;
  }

  /* 抽屜子選單往右開 */
  .dropdown .submenu {
    top: 0;
    left: calc(100% + 10px);
  }

  /* 進出場動畫 */
  .nav-links > li > a {
    font-size: 1.2rem;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.4s ease;
  }
  .nav-links.active > li > a {
    opacity: 1;
    transform: translateX(0);
  }
  .nav-links > li:nth-child(1) > a {
    transition-delay: 0.1s;
  }
  .nav-links > li:nth-child(2) > a {
    transition-delay: 0.2s;
  }
  .nav-links > li:nth-child(3) > a {
    transition-delay: 0.3s;
  }
  .nav-links > li:nth-child(4) > a {
    transition-delay: 0.4s;
  }
  .nav-links > li:nth-child(5) > a {
    transition-delay: 0.5s;
  }

  /* overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    backdrop-filter: blur(4px);
    z-index: 999;
  }
  .overlay.active {
    opacity: 1;
    visibility: visible;
  }
}
</style>
