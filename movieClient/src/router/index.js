/* ---------------------------------------------------------------
 *  src/router/index.ts
 * -------------------------------------------------------------
 *  - 登入成功時請在 LoginView 將 token 寫入 localStorage.token
 *  - 未登入直接打需要驗證的頁 → SweetAlert 提示後導向 /login
 *  - 已登入但手動輸入 /login → 會被導向 /home
 * -------------------------------------------------------------*/

import { createRouter, createWebHistory } from "vue-router";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ---------- 版面元件 ---------- */
import BookTicket from "@/components/bookTicket.vue";
import CinemaEvent from "@/components/cinemaEvent.vue";
import ComingSoonMovie from "@/movies/comingSoonMovie.vue";
import HomeView from "@/components/HomeView.vue";
import MemberCenter from "@/components/memberCenter.vue";
import MemberEvent from "@/components/memberEvent.vue";
import MovieView from "@/components/MovieView.vue";
import OnShowMovie from "@/movies/onShowMovie.vue";
import SocialArea from "@/components/socialArea.vue";
import TicketView from "@/components/ticketView.vue";
import EventDetail from "@/views/EventDetail.vue";
import MemberIn from "@/components/memberIn.vue";
import CreatMemberEvent from "@/views/CreatMemberEvent.vue";
import MemberEventDetail from "@/views/MemberEventDetail.vue";
import CinemaEventDetail from "@/views/CinemaEventDetail.vue";
import MemberInform from "@/views/MemberInform.vue";
import MovieDetail from "@/movies/MovieDetail.vue";
import MealsView from "@/views/mealsView.vue";
import OrderDetail from "@/views/orderDetail.vue";
import ThankYou from "@/views/thankYou.vue";
import QrcodeView from "@/views/qrcodeView.vue";

/* ---------- Auth / Chat ---------- */
import LoginView from "@/components/loginView.vue";
import RegisterView from "@/components/registerView.vue";
import ChatApp from "@/components/ChatApp.vue";
import MovieReview from "@/movies/MovieReview.vue";
import GoogleCallback from "@/components/GoogleCallback.vue";
import LineCallback from "@/components/LineCallback.vue";

const routes = [
  { path: "/", redirect: "/home" },

  /* -------- 公開路由 -------- */
  { path: "/home", component: HomeView, name: "home" },
  {
    path: "/movie",
    redirect: "/onShowMovie",
    component: MovieView,
    name: "movie",
  },
  { path: "/onShowMovie", component: OnShowMovie, name: "onShowMovie" },
  {
    path: "/comingSoonMovie",
    component: ComingSoonMovie,
    name: "comingSoonMovie",
  },
  { path: "/movies/:movieId", component: MovieDetail, name: "movieDetail" },
  { path: "/movieReview", component: MovieReview, name: "movieReview" },

  {
    path: "/event",
    redirect: "/cinemaEvent",
    component: MovieView,
    name: "event",
  },
  { path: "/cinemaEvent", component: CinemaEvent, name: "cinemaEvent" },
  {
    path: "/cinemaEvent/:id",
    component: CinemaEventDetail,
    name: "cinemaEventDetail",
  },
  { path: "/event/:id", component: EventDetail, name: "eventDetail" },

  /* -------- 需要登入的路由 -------- */
  {
    path: "/bookTicket/:id",
    component: BookTicket,
    name: "bookTicket",
    meta: { requiresAuth: true },
  },
  {
    path: "/ticket",
    component: TicketView,
    name: "ticket",
    meta: { requiresAuth: true },
  },
  {
    path: "/chat",
    component: ChatApp,
    name: "chat",
    meta: { requiresAuth: true, hideFooter: true },
  },
  {
    path: "/memberCenter",
    component: MemberCenter,
    name: "memberCenter",
    meta: { requiresAuth: true },
  },
  {
    path: "/memberEvent",
    component: MemberEvent,
    name: "memberEvent",
    meta: { requiresAuth: true },
  },
  {
    path: "/memberEvent/:id",
    component: EventDetail,
    name: "memberEventDetail",
    meta: { requiresAuth: true },
  },
  {
    path: "/createMemberEvent",
    component: CreatMemberEvent,
    name: "createMemberEvent",
    meta: { requiresAuth: true },
  },
  {
    path: "/memberEventDetail/:id",
    component: MemberEventDetail,
    name: "memberEventDetailView",
    meta: { requiresAuth: true },
  },
  {
    path: "/memberInform",
    component: MemberInform,
    name: "memberInform",
    meta: { requiresAuth: true },
  },
  {
    path: "/socialArea",
    component: SocialArea,
    name: "socialArea",
    meta: { requiresAuth: true },
  },
  {
    path: "/memberIn",
    component: MemberIn,
    name: "memberIn",
    meta: { requiresAuth: true },
  },
  {
    path: "/meals",
    component: MealsView,
    name: "meals",
    meta: { requiresAuth: true },
  },
  {
    path: "/orderDetail",
    component: OrderDetail,
    name: "orderDetail",
    meta: { requiresAuth: true },
  },
  {
    path: "/qrcode",
    component: QrcodeView,
    name: "qrcode",
    // 若需要驗證就取消註解
    // meta: { requiresAuth: true },
  },

  /* -------- Auth -------- */
  { path: "/login", component: LoginView, name: "login" },
  { path: "/register", component: RegisterView, name: "register" },
  {
    path: "/google-callback",
    component: GoogleCallback,
    name: "googleCallback",
  },
  { path: "/line-callback", component: LineCallback, name: "lineCallback" },

  /* -------- 404 -------- */
  { path: "/:pathMatch(.*)*", redirect: "/home" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

/* ================================================================
 *  全域守衛：檢查 JWT
 * ----------------------------------------------------------------
 *  1. 有 requiresAuth 而 localStorage.token 不存在 → SweetAlert 後導向 /login
 *  2. 已登入還想進 /login 或 /register → 轉回 /home
 * ================================================================*/
router.beforeEach(async (to) => {
  const token = localStorage.getItem("token");

  /* 1️⃣ 未登入卻想進需要驗證的頁 */
  if (to.meta.requiresAuth && !token) {
    await Swal.fire({
      icon: "warning",
      title: "請先登入",
      confirmButtonText: "前往登入",
      allowOutsideClick: false,
    });

    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  /* 2️⃣ 已登入卻想再去 /login 或 /register → 送回 /home */
  if (token && (to.path === "/login" || to.path === "/register")) {
    return { path: "/home" };
  }

  /* 3️⃣ 其他狀況照常放行（不需回傳任何東西） */
});

export default router;
