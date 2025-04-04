// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import LeaderboardView from '@/views/LeaderboardView.vue';
import AboutView from '@/views/AboutView.vue';
import MyGamesView from "@/views/MyGamesView.vue";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/profile", name: "Profile", component: ProfileView },
  { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/my-games', name: 'mygames', component: MyGamesView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;