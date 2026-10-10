// 权限清单：唯一维护入口。
// ⚠ 本文件会被 vite.config.js 在 Node 侧直接加载，必须保持零依赖（不要引入任何 import）。
// 命名规范：模块:实体:操作（至少三段，全小写），如 admin:user:page。
// permType 由分组决定：pagePermissions → 1（页面），componentPermissions → 2（组件）。
// 新增权限点后无需手动同步：dev 启动会审计提示，build 会校验并导出 dist/permissions.json。

// 页面权限：对应路由 meta.permission
export const pagePermissions = [
  { name: '用户管理', key: 'admin:user:page' },
  { name: '角色管理', key: 'admin:role:page' },
  { name: '权限管理', key: 'admin:perm:page' },
  { name: '设备管理', key: 'admin:device:page' }
]

// 组件权限：对应 v-permission 指令
export const componentPermissions = [
  { name: '保存个人信息', key: 'user:profile:edit' },
  { name: '启用/禁用设备', key: 'user:device:disable' },
  { name: '启用/停用用户', key: 'admin:user:status' },
  { name: '查看用户登录日志', key: 'admin:user:log' },
  { name: '查看用户设备', key: 'admin:user:device' },
  { name: '分配用户角色', key: 'admin:user:assign' },
  { name: '新增角色', key: 'admin:role:create' },
  { name: '编辑角色', key: 'admin:role:edit' },
  { name: '删除角色', key: 'admin:role:del' },
  { name: '分配权限', key: 'admin:role:assign' },
  { name: '新增权限', key: 'admin:perm:create' },
  { name: '编辑权限', key: 'admin:perm:edit' },
  { name: '删除权限', key: 'admin:perm:del' }
]

// key -> { name, type } 索引，供指令/守卫查询
export const permissionMap = new Map([
  ...pagePermissions.map((p) => [p.key, { name: p.name, type: 1 }]),
  ...componentPermissions.map((p) => [p.key, { name: p.name, type: 2 }])
])
