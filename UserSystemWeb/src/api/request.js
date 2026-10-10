import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { useAuth } from '@/composables/useAuth'
import { API_PREFIX, REQUEST_TIMEOUT_MS } from '@/utils/constants'

// 后端接口基础地址：运行时从 public/config.js 读取，
// 打包后直接修改 dist/config.js 即可生效，无需重新构建。
const baseURL = window.__APP_CONFIG__?.API_BASE_URL || '/api'

const instance = axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT_MS,
  // 跨域携带 HttpOnly Cookie（RefreshToken-UserSystem），配合网关 CORS 的 allowCredentials
  withCredentials: true,
  // 数组参数序列化为「重复 key」（permissionIds=1&permissionIds=2），匹配后端 @RequestParam List<Long>
  paramsSerializer: { indexes: null }
})

// 刷新 token 使用独立的无拦截器实例，避免 401 循环
const refreshClient = axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true
})

// 刷新 token：无请求参数，身份来自 HttpOnly Cookie，成功返回 LoginResultVO
async function refreshToken() {
  const { data } = await refreshClient.post(`${API_PREFIX}/public/refresh`)
  if (data?.code === 200) return data.data
  throw data || new Error('刷新 token 失败')
}

// 单例刷新：并发多个 401 只发起一次（服务端有重放检测，避免误触发）
let refreshPromise = null
function refreshAndUpdateAuth() {
  refreshPromise ??= refreshToken()
    .then((result) => {
      useAuth().setAuth(result || {})
      return result?.accessToken || ''
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// 清除登录态并跳转登录页（并发 401 只提示/跳转一次）
let redirecting = false
function clearAuthAndRedirect() {
  useAuth().clearAuth()

  const { path, fullPath } = router.currentRoute.value
  if (redirecting || path === '/login') return

  redirecting = true
  ElMessage({ message: '登录已过期，请重新登录', type: 'warning' })
  router
    .push({ path: '/login', query: { redirect: fullPath } })
    .finally(() => {
      redirecting = false
    })
}

// 请求拦截：附加 Access Token（token 为原始 JWT，需拼接 `Bearer ` 前缀）
instance.interceptors.request.use(
  (config) => {
    const { token } = useAuth()
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截：解包 Result<T>；401 先刷新 token 重试，仍失败再跳登录页
instance.interceptors.response.use(
  (res) => {
    // 文件流 / 二进制响应不做 Result 解包，原样返回
    const { responseType } = res.config
    if (responseType === 'blob' || responseType === 'arraybuffer') {
      return res
    }

    const data = res.data
    if (data?.code === 200) return data

    ElMessage({ message: data?.message || '服务异常', type: 'error' })
    return Promise.reject(data)
  },
  (err) => {
    const status = err.response?.status
    const originalRequest = err.config

    // 401 且未重试过 → 刷新 token 后重试原请求
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      return refreshAndUpdateAuth()
        .then((token) => {
          if (token) originalRequest.headers.Authorization = `Bearer ${token}`
          return instance(originalRequest)
        })
        .catch(() => {
          clearAuthAndRedirect()
          return Promise.reject(err)
        })
    }

    if (status === 401) {
      clearAuthAndRedirect()
    } else {
      ElMessage({ message: err.response?.data?.message || '服务异常', type: 'error' })
    }

    console.error(err)
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
