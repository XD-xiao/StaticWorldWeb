// 用户接口：用户信息 / 状态 / 登录日志 / 设备（前缀 /user，均需认证）
import request from '@/api/request'
import { API_PREFIX } from '@/utils/constants'

// 获取指定用户信息
export const getUserInfo = (userId) =>
  request.get(`${API_PREFIX}/user/userInfo`, { params: { userId } })

// 修改本人信息（仅提交非空字段）
export const updateMyInfo = (payload) =>
  request.put(`${API_PREFIX}/user/userInfo/update/me`, null, { params: payload })

// 上传头像（multipart，字段名 file），返回 { url }
export const uploadAvatar = (formData) =>
  request.post(`${API_PREFIX}/user/avatar/upload`, formData)

// 修改用户状态（status：1 启用 / 0 停用）
export const updateUserStatus = (userId, status) =>
  request.put(`${API_PREFIX}/user/userStatus/update`, null, { params: { userId, status } })

// 用户列表（分页 + 筛选）
export const getUserList = (params) =>
  request.get(`${API_PREFIX}/user/userList`, { params })

// 本人登录日志（分页）
export const getMyLoginLogs = (params) =>
  request.get(`${API_PREFIX}/user/loginLog/me`, { params })

// 指定用户登录日志（分页）
export const getUserLoginLogs = (params) =>
  request.get(`${API_PREFIX}/user/loginLog`, { params })

// 本人设备列表（分页，可 fingerprint / status 过滤）
export const getMyDevices = (params) =>
  request.get(`${API_PREFIX}/user/deviceList/me`, { params })

// 修改本人设备状态（id 为用户-设备关联 ID）
export const updateMyDeviceStatus = (id, status) =>
  request.put(`${API_PREFIX}/user/deviceList/update/me`, null, { params: { id, status } })

// 指定用户设备列表（分页）
export const getUserDevices = (params) =>
  request.get(`${API_PREFIX}/user/deviceList/user`, { params })
