// 公开接口：验证码 / 注册 / 登录 / 刷新 / 登出（无需认证，前缀 /public）
import request from '@/api/request'
import { API_PREFIX } from '@/utils/constants'

// 发送邮箱验证码（type：1 注册 / 2 登录）
export const getCode = (email, type) =>
  request.get(`${API_PREFIX}/public/getCode`, { params: { email, type } })

// 注册（email + password + code）
export const register = (payload) =>
  request.post(`${API_PREFIX}/public/register`, null, { params: payload })

// 密码登录（浏览器字段为 browser）
export const loginByPassword = (payload) =>
  request.post(`${API_PREFIX}/public/loginByPassword`, null, { params: payload })

// 验证码登录（浏览器字段为 browserName）
export const loginByCode = (payload) =>
  request.post(`${API_PREFIX}/public/loginByCode`, null, { params: payload })

// 刷新短 Token（无参数，身份来自 HttpOnly Cookie）
export const refresh = () => request.post(`${API_PREFIX}/public/refresh`)

// 登出（无参数，作废当前设备会话）
export const logout = () => request.post(`${API_PREFIX}/public/logout`)
