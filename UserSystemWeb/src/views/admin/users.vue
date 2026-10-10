<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { getUserList, updateUserStatus } from '@/api/modules/user'
import { GENDER, USER_STATUS } from '@/utils/enums'
import UserLogDrawer from '@/components/admin/UserLogDrawer.vue'
import UserDeviceDrawer from '@/components/admin/UserDeviceDrawer.vue'
import RoleAssignDrawer from '@/components/admin/RoleAssignDrawer.vue'

const query = reactive({ email: '', nickname: '', gender: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const logVisible = ref(false)
const deviceVisible = ref(false)
const assignVisible = ref(false)
const current = ref(null)

const avatarText = (row) => (row.nickname || row.email || 'U').slice(0, 1).toUpperCase()

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (query.email) params.email = query.email
    if (query.nickname) params.nickname = query.nickname
    if (query.gender !== '') params.gender = query.gender
    const res = await getUserList(params)
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
  query.email = ''
  query.nickname = ''
  query.gender = ''
  search()
}

function openLog(row) {
  current.value = row
  logVisible.value = true
}

function openDevice(row) {
  current.value = row
  deviceVisible.value = true
}

function openAssign(row) {
  current.value = row
  assignVisible.value = true
}

async function toggleStatus(row) {
  const next = row.status === 1 ? 0 : 1
  if (next === 0) {
    try {
      await ElMessageBox.confirm('停用将立即踢下线，确认停用该用户？', '提示', {
        confirmButtonText: '停用',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  try {
    await updateUserStatus(row.userId, next)
    row.status = next
    ElMessage.success('操作成功')
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
        <el-form-item label="邮箱">
          <el-input
            v-model="query.email"
            placeholder="邮箱模糊查询"
            clearable
            style="width: 200px"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input
            v-model="query.nickname"
            placeholder="昵称模糊查询"
            clearable
            style="width: 180px"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="query.gender" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="(text, val) in GENDER" :key="val" :label="text" :value="Number(val)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="用户" min-width="220">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" :src="row.avatar || undefined" class="user-cell__avatar">
                {{ avatarText(row) }}
              </el-avatar>
              <div class="user-cell__info">
                <div class="user-cell__name">{{ row.nickname || '未设置昵称' }}</div>
                <div class="user-cell__email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="{ row }">{{ GENDER[row.gender] ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="USER_STATUS[row.status]?.type || 'info'" size="small" round>
              {{ USER_STATUS[row.status]?.text || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'admin:user:log'" link type="primary" size="small" @click="openLog(row)">
              日志
            </el-button>
            <el-button v-permission="'admin:user:device'" link type="primary" size="small" @click="openDevice(row)">
              设备
            </el-button>
            <el-button v-permission="'admin:user:assign'" link type="primary" size="small" @click="openAssign(row)">
              分配角色
            </el-button>
            <el-button
              v-permission="'admin:user:status'"
              link
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '停用' : '启用' }}
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

    <UserLogDrawer v-model="logVisible" :user-id="current?.userId" :nickname="current?.nickname" />
    <UserDeviceDrawer v-model="deviceVisible" :user-id="current?.userId" :nickname="current?.nickname" />
    <RoleAssignDrawer
      v-model="assignVisible"
      :user-id="current?.userId"
      :nickname="current?.nickname"
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-cell__avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #6c7cf0 0%, #ff8fb1 100%);
  color: #fff;
  font-weight: 600;
}

.user-cell__info {
  min-width: 0;
}

.user-cell__name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-cell__email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.admin-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
