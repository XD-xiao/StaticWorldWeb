import { computed } from 'vue'
import { usePermissionStore } from '@/stores'

// 权限组合式函数：封装权限列表与权限判断（供 v-if / 脚本逻辑使用）
export function usePermission() {
  const permissionStore = usePermissionStore()

  const permissions = computed(() => permissionStore.permissionKeys)

  return {
    permissions,
    hasPermission: (key) => permissionStore.hasPermission(key),
    hasAnyPermission: (keys) => permissionStore.hasAnyPermission(keys),
    hasAllPermissions: (keys) => permissionStore.hasAllPermissions(keys),
    setPermissions: (list) => permissionStore.setPermissions(list),
    resetPermissions: () => permissionStore.reset()
  }
}
