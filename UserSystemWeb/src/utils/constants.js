// 全局常量

// 页面标题（同时用于 index.html，路由守卫会拼成 "页面名 - 标题"）
export const APP_TITLE = '用户系统'

// 后端服务基础路径（与 request.js 的 baseURL 拼接）
export const API_PREFIX = '/api/userservice'

// 请求超时（毫秒）
export const REQUEST_TIMEOUT_MS = 100000

// 设备指纹 localStorage 存储 key
export const DEVICE_ID_STORAGE_KEY = 'device_id'
