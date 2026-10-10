import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 权限仓库：当前登录账号的权限点（permKey）
// state 用数组存储（可被持久化直接序列化），对外提供 Set 做 O(1) 查找。
export const usePermissionStore = defineStore('permission', () => {
  const permissionKeys = ref([])

  const permissionSet = computed(() => new Set(permissionKeys.value))

  const setPermissions = (list) => {
    const source = Array.isArray(list) || list instanceof Set ? list : []
    const next = new Set()
    for (const p of source) {
      const key = typeof p === 'string' ? p : p?.permKey
      if (key) next.add(key)
    }
    permissionKeys.value = [...next]
  }

  // 未传 key 视为无权限（默认拒绝）
  const hasPermission = (key) => Boolean(key) && permissionSet.value.has(key)
  const hasAnyPermission = (keys) => toArray(keys).some(hasPermission)
  const hasAllPermissions = (keys) => {
    const arr = toArray(keys)
    return arr.length > 0 && arr.every(hasPermission)
  }

  const reset = () => {
    permissionKeys.value = []
  }

  return { permissionKeys, setPermissions, hasPermission, hasAnyPermission, hasAllPermissions, reset }
}, {
  persist: {
    key: 'app:permission'
  }
})

function toArray(keys) {
  return Array.isArray(keys) ? keys : [keys]
}
