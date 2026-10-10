<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { UserFilled } from '@element-plus/icons-vue'
import { getRoles, deleteRole } from '@/api/modules/admin'
import RoleFormDialog from '@/components/admin/RoleFormDialog.vue'
import PermissionAssignDrawer from '@/components/admin/PermissionAssignDrawer.vue'

const query = reactive({ keyword: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const formVisible = ref(false)
const formData = ref(null)
const assignVisible = ref(false)
const current = ref(null)

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (query.keyword) params.keyword = query.keyword
    const res = await getRoles(params)
    list.value = res?.data?.list || []
    total.value = Number(res?.data?.total) || 0
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function reset() {
  query.keyword = ''
  search()
}

function openAdd() {
  formData.value = null
  formVisible.value = true
}

function openEdit(row) {
  formData.value = row
  formVisible.value = true
}

function openAssign(row) {
  current.value = row
  assignVisible.value = true
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除角色「${row.roleName}」？关联的用户-角色、角色-权限关系将一并清理。`,
      '提示',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    load()
  } catch (e) {
    // 拦截器已统一提示
  }
}

onMounted(load)
</script>

<template>
  <div class="admin-page">

    <el-card shadow="never" class="admin-card">
      <el-form :model="query" inline class="filter-form">
        <el-form-item label="关键字">
          <el-input
            v-model="query.keyword"
            placeholder="按名称 / 标识查询"
            clearable
            style="width: 240px"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item>
          <el-button v-permission="'admin:role:create'" type="primary" @click="openAdd">新增角色</el-button>
          <el-button @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="角色" min-width="220">
          <template #default="{ row }">
            <div class="role-cell">
              <div class="role-cell__icon"><el-icon><UserFilled /></el-icon></div>
              <div class="role-cell__info">
                <div class="role-cell__name">{{ row.roleName }}</div>
                <div class="role-cell__key">{{ row.roleKey }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column prop="updateTime" label="更新时间" min-width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'admin:role:edit'" link type="primary" size="small" @click="openEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="'admin:role:assign'" link type="primary" size="small" @click="openAssign(row)">
              分配权限
            </el-button>
            <el-button v-permission="'admin:role:del'" link type="danger" size="small" @click="remove(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="admin-pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="size"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="load"
        />
      </div>
    </el-card>

    <RoleFormDialog v-model="formVisible" :data="formData" @saved="load" />
    <PermissionAssignDrawer
      v-model="assignVisible"
      :role-id="current?.id"
      :role-name="current?.roleName"
      @saved="load"
    />
  </div>
</template>

<style scoped>
.admin-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(108, 124, 240, 0.06);
}

.filter-form {
  margin-bottom: 4px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.role-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-cell__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6c7cf0 0%, #ff8fb1 100%);
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
}

.role-cell__info {
  min-width: 0;
}

.role-cell__name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.role-cell__key {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.admin-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
