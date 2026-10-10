// 主布局菜单配置：供侧边栏与路由守卫共用。
// permission 字段用于按当前登录账号的权限点过滤菜单项；
// 个人中心分组不设权限（对所有登录用户开放）。
import {
  User,
  Monitor,
  Document,
  Brush,
  UserFilled,
  Avatar,
  Key,
  Cpu
} from '@element-plus/icons-vue'

export const menus = [
  {
    title: '个人中心',
    items: [
      { path: '/account/profile', title: '个人信息', icon: User },
      { path: '/account/devices', title: '我的设备', icon: Monitor },
      { path: '/account/logs', title: '登录日志', icon: Document },
      { path: '/account/settings', title: '外观设置', icon: Brush }
    ]
  },
  {
    title: '后台管理',
    items: [
      { path: '/admin/users', title: '用户管理', icon: UserFilled, permission: 'admin:user:page' },
      { path: '/admin/roles', title: '角色管理', icon: Avatar, permission: 'admin:role:page' },
      { path: '/admin/permissions', title: '权限管理', icon: Key, permission: 'admin:perm:page' },
      { path: '/admin/devices', title: '设备管理', icon: Cpu, permission: 'admin:device:page' }
    ]
  }
]
