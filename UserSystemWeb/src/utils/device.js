// 设备信息采集通用工具：供设备信息页 / 登录注册等需要 deviceId 与浏览器信息的模块复用。

import { generateFingerprint } from 'device-fingerprint-js'
import { DEVICE_ID_STORAGE_KEY } from './constants'

// 安全获取 UA（兼容非浏览器环境）
function getUserAgent() {
  return (typeof navigator !== 'undefined' && navigator.userAgent) || ''
}

/**
 * 浏览器解析（名称 + 版本）。
 * @param {string} [ua] UserAgent
 * @returns {{ name: string, version: string }}
 */
export function parseBrowser(ua = getUserAgent()) {
  const matched = [
    [/Edg\/(\d+[\d.]*)/, 'Microsoft Edge'],
    [/Edge\/(\d+[\d.]*)/, 'Microsoft Edge (Legacy)'],
    [/OPR\/(\d+[\d.]*)/, 'Opera'],
    [/Firefox\/(\d+[\d.]*)/, 'Mozilla Firefox'],
    [/Chrome\/(\d+[\d.]*)/, 'Google Chrome'],
    [/Version\/(\d+[\d.]*).*Safari/, 'Apple Safari']
  ]
  for (const [re, name] of matched) {
    const m = ua.match(re)
    if (m) return { name, version: m[1] }
  }
  return { name: '未知', version: '未知' }
}

/**
 * 时区（IANA 名称，如 Asia/Shanghai）。
 * @returns {string}
 */
export function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '未知'
  } catch (e) {
    return '未知'
  }
}

/**
 * 异步获取地理位置（未授权或失败返回 null，不阻塞主流程）。
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number } | null>}
 */
export function getGeolocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  })
}

/**
 * 读取已持久化的设备指纹。
 * @returns {string}
 */
export function getStoredDeviceId() {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(DEVICE_ID_STORAGE_KEY) || ''
}

/**
 * 持久化设备指纹。
 * @param {string} id
 */
export function setStoredDeviceId(id) {
  if (typeof localStorage !== 'undefined' && id) {
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, id)
  }
}

/**
 * 生成或读取 16 位设备指纹（优先读 localStorage，未命中则通过 canvas/audio 等信号生成）。
 * @returns {Promise<string>}
 */
export async function ensureDeviceId() {
  const cached = getStoredDeviceId()
  if (cached) return cached

  let deviceId = ''
  try {
    const result = await generateFingerprint()
    deviceId = result?.deviceId || ''
  } catch (e) {
    console.error('生成设备指纹失败:', e)
  }

  if (deviceId) setStoredDeviceId(deviceId)
  return deviceId
}
