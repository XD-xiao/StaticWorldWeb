// 路由表（纯数据，不引入任何 store，避免与 request.js 形成循环依赖）
import Layout from '@/layout/index.vue'

// 静态路由：无需权限点，始终注册
export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/account/profile',
    children: [
      // 个人中心：仅需登录（meta.requiresAuth），无页面权限点
      {
        path: 'account/profile',
        name: 'accountProfile',
        component: () => import('@/views/account/profile.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      },
      {
        path: 'account/devices',
        name: 'accountDevices',
        component: () => import('@/views/account/devices.vue'),
        meta: { title: '我的设备', requiresAuth: true }
      },
      {
        path: 'account/logs',
        name: 'accountLogs',
        component: () => import('@/views/account/logs.vue'),
        meta: { title: '登录日志', requiresAuth: true }
      },
      {
        path: 'account/settings',
        name: 'accountSettings',
        component: () => import('@/views/account/settings.vue'),
        meta: { title: '外观设置', requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无访问权限' }
  },
  // 兜底：必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

// 权限路由：后台管理页，登录后由守卫按 meta.permission 校验页面权限
export const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/users',
    children: [
      {
        path: 'users',
        name: 'adminUsers',
        component: () => import('@/views/admin/users.vue'),
        meta: { title: '用户管理', requiresAuth: true, permission: 'admin:user:page' }
      },
      {
        path: 'roles',
        name: 'adminRoles',
        component: () => import('@/views/admin/roles.vue'),
        meta: { title: '角色管理', requiresAuth: true, permission: 'admin:role:page' }
      },
      {
        path: 'permissions',
        name: 'adminPermissions',
        component: () => import('@/views/admin/permissions.vue'),
        meta: { title: '权限管理', requiresAuth: true, permission: 'admin:perm:page' }
      },
      {
        path: 'devices',
        name: 'adminDevices',
        component: () => import('@/views/admin/devices.vue'),
        meta: { title: '设备管理', requiresAuth: true, permission: 'admin:device:page' }
      }
    ]
  }
]
