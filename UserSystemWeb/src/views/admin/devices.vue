<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Monitor, Cellphone, Platform } from '@element-plus/icons-vue'
import { getDeviceList } from '@/api/modules/device'

const DEVICE_TYPES = ['Desktop', 'Mobile', 'Tablet']

const deviceIcon = (type) =>
  ({ Desktop: Monitor, Mobile: Cellphone, Tablet: Platform }[type] || Monitor)

const query = reactive({ fingerprint: '', deviceType: '', osName: '', browserName: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (query.fingerprint) params.fingerprint = query.fingerprint
    if (query.deviceType) params.deviceType = query.deviceType
    if (query.osName) params.osName = query.osName
    if (query.browserName) params.browserName = query.browserName
    const res = await getDeviceList(params)
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
  query.fingerprint = ''
  query.deviceType = ''
  query.osName = ''
  query.browserName = ''
  search()
}

onMounted(load)
</script>

<template>
  <div class="admin-page">

    <el-card shadow="never" class="admin-card">
      <el-form :model="query" inline class="filter-form">
        <el-form-item label="指纹">
          <el-input
            v-model="query.fingerprint"
            placeholder="设备指纹"
            clearable
            style="width: 200px"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.deviceType" placeholder="全部" clearable style="width: 130px">
            <el-option v-for="t in DEVICE_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统">
          <el-input
            v-model="query.osName"
            placeholder="操作系统"
            clearable
            style="width: 150px"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="浏览器">
          <el-input
            v-model="query.browserName"
            placeholder="浏览器名称"
            clearable
            style="width: 150px"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="设备" min-width="180">
          <template #default="{ row }">
            <div class="device-cell">
              <div class="device-cell__icon"><el-icon><component :is="deviceIcon(row.deviceType)" /></el-icon></div>
              <div class="device-cell__info">
                <div class="device-cell__name">{{ row.deviceCategory || '未知设备' }}</div>
                <div class="device-cell__type">{{ row.deviceType || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="指纹" min-width="160">
          <template #default="{ row }">
            <el-tooltip :content="row.fingerprint" placement="top" :disabled="!row.fingerprint">
              <span class="mono">{{ row.fingerprint || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作系统" min-width="140">
          <template #default="{ row }">{{ row.osName }} {{ row.osVersion }}</template>
        </el-table-column>
        <el-table-column label="浏览器" min-width="150">
          <template #default="{ row }">{{ row.browserName }} {{ row.browserVersion }}</template>
        </el-table-column>
        <el-table-column label="UA" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.userAgent" placement="top" :disabled="!row.userAgent">
              <span class="mono ellipsis">{{ row.userAgent || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="首次出现" min-width="170" />
        <el-table-column prop="updateTime" label="更新时间" min-width="170" />
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

.device-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-cell__icon {
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

.device-cell__info {
  min-width: 0;
}

.device-cell__name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.device-cell__type {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}

.ellipsis {
  display: block;
  max-width: 180px;
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
