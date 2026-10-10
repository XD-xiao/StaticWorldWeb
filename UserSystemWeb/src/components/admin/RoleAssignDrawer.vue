<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { Search } from '@element-plus/icons-vue'
import { getRoles, getUserRoleIds, assignUserRoles } from '@/api/modules/admin'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: String, default: '' },
  nickname: { type: String, default: '' }
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

// 已选角色 ID 集合，跨分页持久化，保存时全量覆盖
const selectedRoleIds = ref(new Set())
// 程序化回填勾选时置位，避免触发 selection-change 污染集合
const syncing = ref(false)

const selectedCount = computed(() => selectedRoleIds.value.size)

async function load() {
  if (!props.userId) return
  loading.value = true
  syncing.value = true
  try {
    const res = await getRoles({
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
      if (selectedRoleIds.value.has(String(row.id))) table.toggleRowSelection(row, true)
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
  const next = new Set(selectedRoleIds.value)
  for (const id of pageIds) next.delete(id)
  for (const row of selection) next.add(String(row.id))
  selectedRoleIds.value = next
}

async function open() {
  if (!props.userId) return
  page.value = 1
  keyword.value = ''
  try {
    const idsRes = await getUserRoleIds(props.userId)
    selectedRoleIds.value = new Set((idsRes?.data || []).map(String))
  } catch (e) {
    selectedRoleIds.value = new Set()
  }
  load()
}

function close() {
  emit('update:modelValue', false)
}

async function save() {
  const roleIds = [...selectedRoleIds.value]
  saving.value = true
  try {
    await assignUserRoles(props.userId, roleIds)
    ElMessage.success('分配角色成功')
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
    :title="`给 ${nickname || '用户'} 分配角色`"
    size="680px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="role-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索角色名称 / 标识"
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
      <div class="role-toolbar__count">
        已选择 <b>{{ selectedCount }}</b> 个角色
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
        <el-table-column prop="roleName" label="角色名称" min-width="150" />
        <el-table-column prop="roleKey" label="角色标识" min-width="150" />
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
      </el-table>

      <el-empty v-if="!loading && !list.length" description="暂无角色，请先到「角色管理」创建" :image-size="80" />

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
.role-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.role-toolbar__count {
  margin-left: auto;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.role-toolbar__count b {
  color: var(--el-color-primary);
  font-weight: 600;
}

.drawer-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
