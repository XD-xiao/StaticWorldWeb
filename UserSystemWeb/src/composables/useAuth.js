import { computed } from 'vue'
import { useUserStore, usePermissionStore } from '@/stores'

// 认证组合式函数：登录态的统一读写入口（request.js 刷新 token 也走这里）
export function useAuth() {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  const token = computed(() => userStore.token)
  const userInfo = computed(() => userStore.userInfo)
  const loginResult = computed(() => userStore.loginResult)
  const isAuthenticated = computed(() => Boolean(userStore.token))

  // 登录/刷新成功回写：token 与权限一次性同步（token 为原始 accessToken，由请求拦截器拼接 Bearer 前缀）
  const setAuth = (result = {}) => {
    userStore.setLoginResult(result)
    userStore.setUserInfo(result?.userInfo ?? null)
    permissionStore.setPermissions(result?.permissions || [])
  }

  const clearAuth = () => {
    userStore.reset()
    permissionStore.reset()
  }

  return { token, userInfo, loginResult, isAuthenticated, setAuth, clearAuth }
}
