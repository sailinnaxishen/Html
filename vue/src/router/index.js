import { createRouter, createWebHistory } from "vue-router";
import { routes } from "../config";

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  // 假设用 localStorage 里的 token 判断是否登录
  const isLoggedIn = !!localStorage.getItem('token');
  if (to.path !== '/login' && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});
export default router;
