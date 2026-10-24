import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import TodoLayout from "./features/todos/layouts/TodoLayout.vue";
import HomePage from "./features/todos/pages/HomePage.vue";
import NotebookPage from "./features/notebook/pages/NotebookPage.vue";
import ProgressPage from "./features/progress/pages/ProgressPage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";
import apiHelper from "./helpers/apiHelper";

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: LoginPage,
      },
      {
        path: "register",
        name: "register",
        component: RegisterPage,
      },
    ],
  },
  {
    path: "/",
    component: TodoLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
      },
      {
        path: "notebook",
        name: "notebook",
        component: NotebookPage,
        meta: { requiresAuth: true },
      },
      {
        path: "progress",
        name: "progress",
        component: ProgressPage,
        meta: { requiresAuth: true },
      },
      {
        path: "users",
        name: "users",
        component: UsersPage,
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        name: "profile",
        component: ProfilePage,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
  },
];

/**
 * Factory function untuk membuat instance Vue Router dengan history mode dan auth navigation guard.
 * @param {import('vue-router').RouterHistory} history - Mode riwayat navigasi (WebHistory / MemoryHistory untuk testing).
 * @returns {import('vue-router').Router}
 */
export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({
    history,
    routes,
  });

  // Global Navigation Guard: Melindungi rute terproteksi (requiresAuth: true)
  router.beforeEach((to) => {
    const token = apiHelper.getAccessToken();
    if (to.meta.requiresAuth && !token) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
  });

  return router;
}

const router = createAppRouter();

export default router;
