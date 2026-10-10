<script setup>
import { ref, watch } from 'vue'
import { getUserLoginLogs } from '@/api/modules/user'
import { LOGIN_TYPE, LOGIN_RESULT } from '@/utils/enums'
import {
  Clock,
  Location,
  Connection,
  Key,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'

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

const formatCoord = (v) => (typeof v === 'number' ? v.toFixed(4) : v ?? '-')

const locationText = (row) =>
  row.latitude == null || row.longitude == null
    ? '-'
    : `${formatCoord(row.latitude)}, ${formatCoord(row.longitude)}`

const resultIcon = (row) => (row.loginResult === 1 ? CircleCheckFilled : CircleCloseFilled)

async function load() {
  if (!props.userId) return
  loading.value = true
  try {
    const res = await getUserLoginLogs({ userId: props.userId, page: page.value, size: size.value })
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
    :title="`${nickname || '用户'} 的登录日志`"
    size="760px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else>
      <div class="log-list">
        <div
          v-for="row in list"
          :key="row.id"
          class="log-item"
          :class="row.loginResult === 1 ? 'is-success' : 'is-fail'"
        >
          <div class="log-item__icon">
            <el-icon><component :is="resultIcon(row)" /></el-icon>
          </div>

          <div class="log-item__body">
            <div class="log-item__head">
              <span class="log-item__time">{{ row.loginTime || '-' }}</span>
              <el-tag
                :type="LOGIN_RESULT[row.loginResult]?.type || 'info'"
                size="small"
                round
              >
                {{ LOGIN_RESULT[row.loginResult]?.text || '-' }}
              </el-tag>
            </div>

            <div class="log-item__meta">
              <div class="log-item__cell">
                <el-icon><Connection /></el-icon>
                <span>IP：{{ row.loginIp || '-' }}</span>
              </div>
              <div class="log-item__cell">
                <el-icon><Clock /></el-icon>
                <span>{{ row.timezone || '-' }}</span>
              </div>
              <div class="log-item__cell">
                <el-icon><Location /></el-icon>
                <span>{{ locationText(row) }}</span>
              </div>
              <div class="log-item__cell">
                <el-icon><Key /></el-icon>
                <span>{{ LOGIN_TYPE[row.loginType] || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!list.length" description="暂无日志" :image-size="80" />

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
.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  transition: box-shadow 0.2s;
}

.log-item:hover {
  box-shadow: 0 12px 32px rgba(108, 124, 240, 0.12);
}

.log-item.is-success {
  border-left: 3px solid var(--el-color-success);
}

.log-item.is-fail {
  border-left: 3px solid var(--el-color-danger);
}

.log-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  flex-shrink: 0;
}

.is-success .log-item__icon {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.is-fail .log-item__icon {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.log-item__body {
  min-width: 0;
  flex: 1;
}

.log-item__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-item__time {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.log-item__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.log-item__cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.log-item__cell .el-icon {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.log-item__cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
