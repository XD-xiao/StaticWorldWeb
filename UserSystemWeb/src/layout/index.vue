<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const collapsed = ref(false)

function onResize() {
  collapsed.value = window.innerWidth < 992
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="layout" :class="{ 'is-collapsed': collapsed }">
    <Sidebar :collapsed="collapsed" />
    <Navbar :collapsed="collapsed" @toggle-collapse="collapsed = !collapsed" />
    <main class="layout__content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  --layout-sidebar-width: 240px;
  --layout-sidebar-collapsed-width: 64px;
  --layout-navbar-height: 60px;
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.layout__content {
  margin-left: var(--layout-sidebar-width);
  min-height: 100vh;
  padding: 24px;
  padding-top: calc(var(--layout-navbar-height) + 24px);
  box-sizing: border-box;
  transition: margin-left 0.2s;
}

.layout.is-collapsed .layout__content {
  margin-left: var(--layout-sidebar-collapsed-width);
}
</style>
