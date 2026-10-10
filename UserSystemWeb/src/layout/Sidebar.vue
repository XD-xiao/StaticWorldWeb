<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores'
import { menus } from './menu'

defineProps({
  collapsed: { type: Boolean, default: false }
})

const route = useRoute()
const permissionStore = usePermissionStore()

// 过滤后仍可见的分组：后台分组在无任何后台页面权限时整体隐藏
const visibleMenus = computed(() =>
  menus
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || permissionStore.hasPermission(item.permission)
      )
    }))
    .filter((group) => group.items.length > 0)
)

const activePath = computed(() => route.path)
</script>

<template>
  <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="sidebar__brand">
      <div class="sidebar__logo">US</div>
      <span v-if="!collapsed" class="sidebar__title">用户中心</span>
    </div>

    <el-scrollbar class="sidebar__scroll">
      <el-menu
        :default-active="activePath"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        class="sidebar__menu"
      >
        <template v-for="group in visibleMenus" :key="group.title">
          <div v-if="!collapsed" class="sidebar__group-title">{{ group.title }}</div>
          <el-menu-item v-for="item in group.items" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--layout-sidebar-width);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
  transition: width 0.2s;
  z-index: 10;
}

.sidebar.is-collapsed {
  width: var(--layout-sidebar-collapsed-width);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--layout-navbar-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.sidebar.is-collapsed .sidebar__brand {
  padding: 0;
  justify-content: center;
}

.sidebar__logo {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #6c7cf0 0%, #ff8fb1 100%);
}

.sidebar__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.sidebar__scroll {
  flex: 1;
}

.sidebar__menu {
  border-right: none;
  background: transparent;
}

.sidebar__group-title {
  padding: 14px 20px 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.sidebar__menu :deep(.el-menu-item) {
  height: 44px;
  margin: 2px 12px;
  border-radius: 10px;
}

.sidebar.is-collapsed .sidebar__menu :deep(.el-menu-item) {
  margin: 2px 8px;
}

.sidebar__menu :deep(.el-menu-item:hover) {
  background: var(--el-fill-color-light);
}

.sidebar__menu :deep(.el-menu-item.is-active) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>
