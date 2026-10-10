<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { Search, Document, Grid, Connection } from '@element-plus/icons-vue'
import { getPermissions, getRolePermList, assignRolePermission } from '@/api/modules/admin'
import { PERM_TYPE } from '@/utils/enums'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  roleId: { type: String, default: '' },
  roleName: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const tableRef = ref()
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const loading = ref(false)
const saving = ref(false)

// 已选权限 ID 集合，跨分页持久化，保存时全量覆盖
const selectedPermIds = ref(new Set())
// 程序化回填勾选时置位，避免触发 selection-change 污染集合
const syncing = ref(false)

const typeTag = (t) => ({ 1: 'primary', 2: 'success', 3: 'info' }[t] || 'info')
const permIcon = (t) => ({ 1: Document, 2: Grid, 3: Connection }[t] || Document)

const selectedCount = computed(() => selectedPermIds.value.size)

async function load() {
  if (!props.roleId) return
  loading.value = true
  syncing.value = true
  try {
    const res = await getPermissions({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined
    })
    list.value = res?.data?.list || []
    total.value = Number(res?.data?.total) || 0

    await nextTick()
    const table = tableRef.value
    table.clearSelection()
    for (const row of list.value) {
      if (selectedPermIds.value.has(String(row.id))) table.toggleRowSelection(row, true)
    }
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
    syncing.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function onSelectionChange(selection) {
  if (syncing.value) return
  const pageIds = new Set(list.value.map((r) => String(r.id)))
  const next = new Set(selectedPermIds.value)
  for (const id of pageIds) next.delete(id)
  for (const row of selection) next.add(String(row.id))
  selectedPermIds.value = next
}

async function open() {
  if (!props.roleId) return
  page.value = 1
  keyword.value = ''
  try {
    const idsRes = await getRolePermList(props.roleId)
    selectedPermIds.value = new Set((idsRes?.data || []).map(String))
  } catch (e) {
    selectedPermIds.value = new Set()
  }
  load()
}

function close() {
  emit('update:modelValue', false)
}

async function save() {
  const permissionIds = [...selectedPermIds.value]
  saving.value = true
  try {
    await assignRolePermission(props.roleId, permissionIds)
    ElMessage.success('分配权限成功')
    emit('saved')
    close()
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    saving.value = false
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) open()
  }
)
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="`给「${roleName || '角色'}」分配权限`"
    size="760px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="perm-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索权限名称 / 标识"
        clearable
        style="width: 260px"
        @keyup.enter="search"
        @clear="search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="search">搜索</el-button>
      <div class="perm-toolbar__count">
        已选择 <b>{{ selectedCount }}</b> 个权限
      </div>
    </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="list"
        row-key="id"
        max-height="54vh"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="权限" min-width="220">
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
        <el-table-column label="路径" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.path || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
      </el-table>

      <el-empty v-if="!loading && !list.length" description="暂无可分配的权限点" :image-size="80" />

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

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="saving" :disabled="loading" @click="save">保存</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.perm-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.perm-toolbar__count {
  margin-left: auto;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.perm-toolbar__count b {
  color: var(--el-color-primary);
  font-weight: 600;
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

.drawer-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
