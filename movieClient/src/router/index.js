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
import memberIn from "@/components/memberIn.vue";
import CreatMemberEvent from "@/views/CreatMemberEvent.vue";
import MemberEventDetail from "@/views/MemberEventDetail.vue";
import CinemaEventDetail from "@/views/CinemaEventDetail.vue";

import { createRouter, createWebHistory } from "vue-router";
import MovieDetail from "@/movies/MovieDetail.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
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

  { path: "/ticket", component: TicketView, name: "ticket" },
  {
    path: "/event",
    redirect: "/cinemaEvent",
    component: MovieView,
    name: "event",
  },
  { path: "/cinemaEvent", component: CinemaEvent, name: "cinemaEvent" },
  { path: "/cinemaEvent/:id", component: CinemaEventDetail, name: "cinemaEventDetail" },
  { path: "/memberEvent", component: MemberEvent, name: "memberEvent" },
  { path: "/socialArea", component: SocialArea, name: "socialArea" },
  { path: "/memberCenter", component: MemberCenter, name: "memberCenter" },
  { path: "/event/:id", component: EventDetail, name: "EventDetail" },
  { path: "/bookTicket/:id", component: BookTicket, name: "bookTicket" },
  { path: "/memberIn", component: memberIn, name: "memberIn" },
  { path: "/memberEvent/:id", component: EventDetail, name: "memberEventDetail" },
  {
    path: "/createMemberEvent",
    component: CreatMemberEvent,
    name: "createMemberEvent",
  },
  {path:'/memberEventDetail/:id',component:MemberEventDetail,name:'te'}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;
