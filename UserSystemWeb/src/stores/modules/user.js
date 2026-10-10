import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户仓库：Access Token + 用户信息
// 持久化只保留必要字段（loginResult 与 token 重复，不落盘）。
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)
  // 登录接口返回的完整结果（LoginResultVO：{ token, permissions }）
  const loginResult = ref(null)

  const setToken = (t) => {
    token.value = t || ''
  }
  const setUserInfo = (info) => {
    userInfo.value = info ?? null
  }
  const setLoginResult = (result) => {
    loginResult.value = result ?? null
    token.value = result?.accessToken || ''
  }
  const reset = () => {
    token.value = ''
    userInfo.value = null
    loginResult.value = null
  }

  return { token, userInfo, loginResult, setToken, setUserInfo, setLoginResult, reset }
}, {
  persist: {
    key: 'app:user',
    pick: ['token', 'userInfo']
  }
})
