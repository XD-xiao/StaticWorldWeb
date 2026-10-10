<script setup>
import { ref, onMounted } from 'vue'
import { getMyLoginLogs } from '@/api/modules/user'
import { LOGIN_TYPE, LOGIN_RESULT } from '@/utils/enums'

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const formatCoord = (v) => (typeof v === 'number' ? v.toFixed(4) : v ?? '-')

const locationText = (row) => {
  if (row.latitude == null || row.longitude == null) return '-'
  return `${formatCoord(row.latitude)}, ${formatCoord(row.longitude)}`
}

async function load() {
  loading.value = true
  try {
    const res = await getMyLoginLogs({ page: page.value, size: size.value })
    list.value = res?.data?.list || []
    total.value = Number(res?.data?.total) || 0
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="account-page">

    <el-card shadow="never" class="account-card">
      <el-skeleton v-if="loading" :rows="6" animated />

      <template v-else>
        <el-table :data="list" stripe>
          <el-table-column prop="loginTime" label="登录时间" min-width="170" />
          <el-table-column label="IP" min-width="130">
            <template #default="{ row }">{{ row.loginIp || '-' }}</template>
          </el-table-column>
          <el-table-column label="时区" min-width="140">
            <template #default="{ row }">{{ row.timezone || '-' }}</template>
          </el-table-column>
          <el-table-column label="位置" min-width="150">
            <template #default="{ row }">{{ locationText(row) }}</template>
          </el-table-column>
          <el-table-column label="登录方式" width="100">
            <template #default="{ row }">{{ LOGIN_TYPE[row.loginType] || '-' }}</template>
          </el-table-column>
          <el-table-column label="结果" width="90">
            <template #default="{ row }">
              <el-tag :type="LOGIN_RESULT[row.loginResult]?.type || 'info'" size="small" round>
                {{ LOGIN_RESULT[row.loginResult]?.text || '-' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="total > 0" class="account-pagination">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next, total"
            background
            @current-change="load"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.account-page {
  max-width: 960px;
  margin: 0 auto;
  /* 撑满可视内容区，使卡片可垂直居中（48px = 布局上下 padding 之和） */
  min-height: calc(100vh - var(--layout-navbar-height) - 48px);
  display: flex;
  flex-direction: column;
}

.account-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(31, 45, 61, 0.08);
  overflow: hidden;
  margin: auto 0;
}

.account-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
