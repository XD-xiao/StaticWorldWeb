import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, asyncRoutes } from './routes'
import { useUserStore, usePermissionStore } from '@/stores'
import { APP_TITLE } from '@/utils/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior: () => ({ top: 0 })
})

// 全局守卫：登录校验 → 权限点校验 → 标题
// 注意：store 必须在守卫回调内获取（此时 pinia 已安装）
router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && userStore.token) {
    return '/'
  }
  if (to.meta.permission && !usePermissionStore().hasPermission(to.meta.permission)) {
    return '/403'
  }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - ${APP_TITLE}` : APP_TITLE
})

export default router
