<script setup>
import { ref, watch } from 'vue'
import { getUserDevices } from '@/api/modules/user'
import { DEVICE_STATUS } from '@/utils/enums'
import { Monitor, Cellphone, Platform, Clock, Cpu, Key } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: String, default: '' },
  nickname: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(8)
const loading = ref(false)

const deviceIcon = (type) =>
  ({ Desktop: Monitor, Mobile: Cellphone, Tablet: Platform }[type] || Monitor)

async function load() {
  if (!props.userId) return
  loading.value = true
  try {
    const res = await getUserDevices({ userId: props.userId, page: page.value, size: size.value })
    list.value = res?.data?.list || []
    total.value = Number(res?.data?.total) || 0
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      page.value = 1
      load()
    }
  }
)
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="`${nickname || '用户'} 的设备`"
    size="820px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else>
      <div class="device-list">
        <div v-for="row in list" :key="row.id" class="device-row">
          <div class="device-row__icon">
            <el-icon><component :is="deviceIcon(row.deviceType)" /></el-icon>
          </div>

          <div class="device-row__main">
            <div class="device-row__name">
              {{ row.deviceCategory || row.deviceType || '未知设备' }}
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
          </div>
        </div>
      </div>

      <el-empty v-if="!list.length" description="暂无设备" :image-size="80" />

      <div v-if="total > 0" class="drawer-pagination">
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
  </el-drawer>
</template>

<style scoped>
.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  transition: box-shadow 0.2s;
}

.device-row:hover {
  box-shadow: 0 12px 32px rgba(108, 124, 240, 0.12);
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

.device-row__item .el-icon {
  color: var(--el-text-color-secondary);
}

.device-row__fp {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-row__foot {
  flex-shrink: 0;
}

.drawer-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
