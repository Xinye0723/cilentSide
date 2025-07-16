import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./style.css";
// import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap CSS
// import "bootstrap"; // 引入 Bootstrap JS
const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
