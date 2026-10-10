<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { Document, Grid, Connection } from '@element-plus/icons-vue'
import { getPermissions, deletePermission } from '@/api/modules/admin'
import { PERM_TYPE } from '@/utils/enums'
import PermissionFormDialog from '@/components/admin/PermissionFormDialog.vue'

const query = reactive({ keyword: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const formVisible = ref(false)
const formData = ref(null)

const typeTag = (t) => ({ 1: 'primary', 2: 'success', 3: 'info' }[t] || 'info')

const permIcon = (t) => ({ 1: Document, 2: Grid, 3: Connection }[t] || Document)

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (query.keyword) params.keyword = query.keyword
    const res = await getPermissions(params)
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

async function remove(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除权限「${row.permName}」？关联的角色-权限关系将一并清理。`,
      '提示',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await deletePermission(row.id)
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
          <el-button v-permission="'admin:perm:create'" type="primary" @click="openAdd">新增权限</el-button>
          <el-button @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="权限" min-width="240">
          <template #default="{ row }">
            <div class="perm-cell">
              <div class="perm-cell__icon"><el-icon><component :is="permIcon(row.permType)" /></el-icon></div>
              <div class="perm-cell__info">
                <div class="perm-cell__name">{{ row.permName }}</div>
                <div class="perm-cell__key" :title="row.permKey">{{ row.permKey }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.permType)" size="small" round>
              {{ PERM_TYPE[row.permType] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="路径" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.path || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'admin:perm:edit'" link type="primary" size="small" @click="openEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="'admin:perm:del'" link type="danger" size="small" @click="remove(row)">
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

    <PermissionFormDialog v-model="formVisible" :data="formData" @saved="load" />
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

.perm-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.perm-cell__icon {
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

.perm-cell__info {
  min-width: 0;
}

.perm-cell__name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.perm-cell__key {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
