import { effectScope, watchEffect } from 'vue'
import { usePermissionStore } from '@/stores'
import { permissionMap } from '@/permissions'

// v-permission 指令：按权限点控制元素显隐 / 禁用。
// 用法：
//   v-permission="'admin:user:log'"                            拥有该权限点才显示
//   v-permission="['admin:user:status', 'admin:user:log']"     任一满足即显示
//   v-permission.all="['admin:user:log', 'admin:user:device']" 需全部满足
//   v-permission.disable="'user:device:disable'"               无权限时禁用而非隐藏
// 权限点变化（登录 / 登出 / 刷新 token）会实时重算。

function toKeys(value) {
  const list = Array.isArray(value) ? value : [value]
  return list.map((item) => (typeof item === 'string' ? item : item?.key)).filter(Boolean)
}

// 开发期提示未登记的权限点，避免拼写错误静默生效
const warned = new Set()
function warnUnregistered(keys) {
  if (!import.meta.env.DEV) return
  for (const key of keys) {
    if (permissionMap.has(key) || warned.has(key)) continue
    warned.add(key)
    console.warn(`[v-permission] 权限点 "${key}" 未在 src/permissions.js 中登记`)
  }
}

const scopes = new WeakMap()

function apply(el, binding) {
  scopes.get(el)?.stop()

  const keys = toKeys(binding.value)
  if (!keys.length) return
  warnUnregistered(keys)

  const permissionStore = usePermissionStore()
  const scope = effectScope()
  scope.run(() => {
    watchEffect(() => {
      const pass = binding.modifiers.all
        ? permissionStore.hasAllPermissions(keys)
        : permissionStore.hasAnyPermission(keys)

      if (binding.modifiers.disable) {
        el.disabled = !pass
        el.classList.toggle('is-disabled', !pass)
      } else {
        el.style.display = pass ? '' : 'none'
      }
    })
  })
  scopes.set(el, scope)
}

export default {
  mounted: apply,
  updated(el, binding) {
    if (binding.value !== binding.oldValue) apply(el, binding)
  },
  unmounted(el) {
    scopes.get(el)?.stop()
    scopes.delete(el)
  }
}
