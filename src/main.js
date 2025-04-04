import './assets/main.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";



import { createApp } from "vue";
import App from "./App.vue";
import router from './router';
import "./main.css";

const app = createApp(App);
app.use(router);

app.mount("#app");

