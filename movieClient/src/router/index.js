import BookTicket from "@/components/bookTicket.vue";
import CinemaEvent from "@/components/cinemaEvent.vue";
import ComingSoonMovie from "@/components/comingSoonMovie.vue";
import HomeView from "@/components/HomeView.vue";
import MemberCenter from "@/components/memberCenter.vue";
import MemberEvent from "@/components/memberEvent.vue";
import MovieView from "@/components/MovieView.vue";
import OnShowMovie from "@/components/onShowMovie.vue";
import SocialArea from "@/components/socialArea.vue";
import TicketView from "@/components/ticketView.vue";
import EventDetail from "@/views/EventDetail.vue";

import { createRouter, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  { path: "/home", component: HomeView, name: "home" },
  // { path: "/about", component: AboutView, name: "about" },

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

  { path: "/ticket", component: TicketView, name: "ticket" },
  {
    path: "/event",
    redirect: "/cinemaEvent",
    component: MovieView,
    name: "event",
  },
  { path: "/cinemaEvent", component: CinemaEvent, name: "cinemaEvent" },
  { path: "/memberEvent", component: MemberEvent, name: "memberEvent" },
  { path: "/socialArea", component: SocialArea, name: "socialArea" },
  { path: "/memberCenter", component: MemberCenter, name: "memberCenter" },
  { path: "/event/:id", component: EventDetail, name: "EventDetail" },
  { path: "/memberEvent", component: MemberEvent, name: "memberEvent" },
  { path: "/bookTicket/:id", component: BookTicket, name: "bookTicket" },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
