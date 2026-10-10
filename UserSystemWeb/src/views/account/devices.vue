<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { Monitor, Cellphone, Platform, Clock, Cpu, Key } from '@element-plus/icons-vue'
import { getMyDevices, updateMyDeviceStatus } from '@/api/modules/user'
import { getStoredDeviceId } from '@/utils/device'
import { DEVICE_STATUS } from '@/utils/enums'

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(8)
const loading = ref(false)
const currentFingerprint = ref('')

const deviceIcon = (type) =>
  ({ Desktop: Monitor, Mobile: Cellphone, Tablet: Platform }[type] || Monitor)

const isCurrent = (row) =>
  Boolean(currentFingerprint.value) && row.fingerprint === currentFingerprint.value

async function load() {
  loading.value = true
  try {
    const res = await getMyDevices({ page: page.value, size: size.value })
    list.value = res?.data?.list || []
    total.value = Number(res?.data?.total) || 0
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
  }
}

async function toggleStatus(row) {
  const next = row.status === 1 ? 0 : 1
  if (next === 0) {
    try {
      await ElMessageBox.confirm('禁用后该设备需重新登录，确认禁用？', '提示', {
        confirmButtonText: '禁用',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  try {
    await updateMyDeviceStatus(row.id, next)
    row.status = next
    ElMessage.success('操作成功')
  } catch (e) {
    // 拦截器已统一提示
  }
}

onMounted(() => {
  currentFingerprint.value = getStoredDeviceId()
  load()
})
</script>

<template>
  <div class="account-page">

    <el-card shadow="never" class="account-card">
      <el-skeleton v-if="loading" :rows="5" animated />

      <template v-else>
        <div class="device-list">
          <div
            v-for="row in list"
            :key="row.id"
            class="device-row"
            :class="{ current: isCurrent(row) }"
          >
            <div class="device-row__icon">
              <el-icon><component :is="deviceIcon(row.deviceType)" /></el-icon>
            </div>

            <div class="device-row__main">
              <div class="device-row__name">
                {{ row.deviceCategory || row.deviceType || '未知设备' }}
                <el-tag v-if="isCurrent(row)" size="small" type="primary" effect="light" round>
                  当前设备
                </el-tag>
              </div>
              <div class="device-row__meta">{{ row.osName }} · {{ row.browserName }}</div>
            </div>

            <div class="device-row__info">
              <div class="device-row__item">
                <el-icon><Cpu /></el-icon>
                <span>{{ row.osName }} {{ row.osVersion }}</span>
              </div>
              <div class="device-row__item">
                <el-icon><Clock /></el-icon>
                <span>最近登录：{{ row.lastLoginTime || '-' }}</span>
              </div>
              <div class="device-row__item">
                <el-icon><Key /></el-icon>
                <span class="device-row__fp" :title="row.fingerprint">{{ row.fingerprint || '-' }}</span>
              </div>
            </div>

            <div class="device-row__foot">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" round>
                {{ DEVICE_STATUS[row.status] ?? '-' }}
              </el-tag>
              <el-switch
                v-permission="'user:device:disable'"
                :model-value="row.status === 1"
                @change="toggleStatus(row)"
              />
            </div>
          </div>
        </div>

        <el-empty v-if="!list.length" description="暂无设备" />

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

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s;
}

.device-row:hover {
  box-shadow: 0 12px 32px rgba(108, 124, 240, 0.12);
}

.device-row.current {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.device-row__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: 22px;
  flex-shrink: 0;
}

.device-row__main {
  min-width: 0;
  flex: 1;
}

.device-row__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.device-row__meta {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.device-row__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.device-row__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-row__fp {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-row__foot {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .device-row__info {
    display: none;
  }
}

.account-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
