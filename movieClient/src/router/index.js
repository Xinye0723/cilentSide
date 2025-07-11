import CinemaEvent from "@/components/cinemaEvent.vue";
import ComingSoonMovie from "@/components/comingSoonMovie.vue";
<<<<<<< HEAD
<<<<<<< HEAD
import HomeView from "@/components/HomeView.vue";
=======
import homeView from "@/components/HomeView.vue";
>>>>>>> xinye1
=======
import homeView from "@/components/HomeView.vue";
>>>>>>> 52c569e7ae41cca9a59a21828abaa70cbd4bcf5f
import MemberCenter from "@/components/memberCenter.vue";
import MemberEvent from "@/components/memberEvent.vue";
import MovieView from "@/components/MovieView.vue";
import OnShowMovie from "@/components/onShowMovie.vue";
import SocialArea from "@/components/socialArea.vue";
import TicketView from "@/components/ticketView.vue";
<<<<<<< HEAD
import AboutView from "@/views/AboutView.vue";
=======
import EventDetail from "@/views/EventDetail.vue";

>>>>>>> 52c569e7ae41cca9a59a21828abaa70cbd4bcf5f
import { createRouter, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  { path: "/home", component: HomeView, name: "home" },
  { path: "/about", component: AboutView, name: "about" },

  { path: "/movie", redirect: "/onShowMovie", component: MovieView, name: "movie"},
  { path: "/onShowMovie", component: OnShowMovie, name: "onShowMovie" },
  { path: "/comingSonnMovie",component: ComingSoonMovie, name: "comingSonnMovie" },
  
  { path: "/ticket", component: TicketView, name: "ticket" },
  { path: "/event", redirect: "/cinemaEvent", component: MovieView, name: "event"},
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
