// 系统管理接口：角色 / 权限管理（前缀 /admin，需认证 + 权限点）
import request from '@/api/request'
import { API_PREFIX } from '@/utils/constants'

// 角色列表（分页 + 关键字）
export const getRoles = (params) =>
  request.get(`${API_PREFIX}/admin/roles`, { params })

// 该角色已分配的权限 ID 列表
export const getRolePermList = (roleId) =>
  request.get(`${API_PREFIX}/admin/roles/permlist`, { params: { roleId } })

// 新增角色
export const addRole = (payload) =>
  request.post(`${API_PREFIX}/admin/roles/add`, null, { params: payload })

// 修改角色
export const updateRole = (payload) =>
  request.put(`${API_PREFIX}/admin/roles/update`, null, { params: payload })

// 删除角色（级联清理关联）
export const deleteRole = (roleId) =>
  request.delete(`${API_PREFIX}/admin/roles/delete`, { params: { roleId } })

// 角色分配权限（permissionIds 重复 key，全量覆盖）
export const assignRolePermission = (roleId, permissionIds) =>
  request.put(`${API_PREFIX}/admin/roles/permission`, null, { params: { roleId, permissionIds } })

// 全部角色（供用户分配角色选择表格使用）
export const getAllRoles = () =>
  request.get(`${API_PREFIX}/admin/roles/all`)

// 用户已分配的角色 ID 列表
export const getUserRoleIds = (userId) =>
  request.get(`${API_PREFIX}/admin/user/roles`, { params: { userId } })

// 分配用户角色（roleIds 重复 key，全量覆盖）
export const assignUserRoles = (userId, roleIds) =>
  request.put(`${API_PREFIX}/admin/user/roles`, null, { params: { userId, roleIds } })

// 权限列表（分页 + 关键字）
export const getPermissions = (params) =>
  request.get(`${API_PREFIX}/admin/permissions`, { params })

// 新增权限
export const addPermission = (payload) =>
  request.post(`${API_PREFIX}/admin/permissions/add`, null, { params: payload })

// 修改权限
export const updatePermission = (payload) =>
  request.put(`${API_PREFIX}/admin/permissions/update`, null, { params: payload })

// 删除权限（级联清理角色-权限关联）
export const deletePermission = (id) =>
  request.delete(`${API_PREFIX}/admin/permissions/delete`, { params: { id } })
