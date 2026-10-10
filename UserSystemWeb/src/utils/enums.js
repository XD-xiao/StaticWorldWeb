// 枚举字典：集中映射状态 / 类型 → 文案 / 标签色，避免散落三元表达式

// 性别
export const GENDER = { 0: '未知', 1: '男', 2: '女' }

// 账号状态
export const USER_STATUS = {
  1: { text: '启用', type: 'success' },
  0: { text: '停用', type: 'danger' }
}

// 登录方式
export const LOGIN_TYPE = { 1: '密码', 2: '验证码', 3: '第三方' }

// 登录结果
export const LOGIN_RESULT = {
  1: { text: '成功', type: 'success' },
  0: { text: '失败', type: 'danger' }
}

// 设备状态
export const DEVICE_STATUS = { 1: '启用', 0: '禁用' }

// 权限类型
export const PERM_TYPE = { 1: '页面', 2: '组件', 3: '接口' }
