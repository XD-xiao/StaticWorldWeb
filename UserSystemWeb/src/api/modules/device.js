// 设备接口：设备维度信息列表（前缀 /device，需认证 + 权限点 device:info:list）
import request from '@/api/request'
import { API_PREFIX } from '@/utils/constants'

// 设备信息列表（分页 + 筛选）
export const getDeviceList = (params) =>
  request.get(`${API_PREFIX}/device/deviceInfo/list`, { params })
