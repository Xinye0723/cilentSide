import CinemaEvent from "@/components/cinemaEvent.vue";
import ComingSoonMovie from "@/components/comingSoonMovie.vue";
import homeView from "@/components/HomeView.vue";
import MemberCenter from "@/components/memberCenter.vue";
import MemberEvent from "@/components/memberEvent.vue";
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
  { path: "/home", component: homeView, name: "home" },
  { path: "/onShowMovie", component: OnShowMovie, name: "onShowMovie" },
  {
    path: "/comingSonnMovie",
    component: ComingSoonMovie,
    name: "comingSonnMovie",
  },
  { path: "/ticket", component: TicketView, name: "ticket" },
  { path: "/cinemaEvent", component: CinemaEvent, name: "cinemaEvent" },
  { path: "/memberEvent", component: MemberEvent, name: "memberEvent" },
  { path: "/socialArea", component: SocialArea, name: "socialArea" },
  { path: "/memberCenter", component: MemberCenter, name: "memberCenter" },
  { path: "/event/:id",component:EventDetail,name:"EventDetail"},
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
