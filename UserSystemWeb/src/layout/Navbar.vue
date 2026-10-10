<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import {
  Fold,
  Expand,
  Sunny,
  Moon,
  ArrowDown,
  User,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores'
import { useAuth } from '@/composables/useAuth'
import { logout } from '@/api/modules/auth'
import { getUserInfo } from '@/api/modules/user'
import { getAccountId } from '@/utils/jwt'

defineProps({
  collapsed: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle-collapse'])

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { token, clearAuth } = useAuth()

const displayName = ref('')
const email = ref('')
const avatar = ref('')

const avatarText = computed(() => (displayName.value || email.value || 'U').slice(0, 1).toUpperCase())

const breadcrumb = computed(() => route.meta.title || '')

onMounted(async () => {
  const userId = getAccountId(token.value)
  if (!userId) return
  try {
    const res = await getUserInfo(userId)
    const info = res?.data
    if (info) {
      displayName.value = info.nickname || ''
      email.value = info.email || ''
      avatar.value = info.avatar || ''
    }
  } catch (e) {
    // 拉取失败时静默降级为默认头像/文案
  }
})

function toggleTheme() {
  appStore.theme = appStore.isDark ? 'light' : 'dark'
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await logout()
  } catch (e) {
    // 登出接口失败也继续清理本地登录态
  }
  clearAuth()
  ElMessage.success('已退出登录')
  router.replace('/login')
}

function goProfile() {
  router.push('/account/profile')
}
</script>

<template>
  <header class="navbar" :class="{ 'is-collapsed': collapsed }">
    <div class="navbar__left">
      <el-icon class="navbar__icon" @click="emit('toggle-collapse')">
        <Expand v-if="collapsed" />
        <Fold v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumb">{{ breadcrumb }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="navbar__right">
      <el-tooltip :content="appStore.isDark ? '切换到明亮模式' : '切换到暗色模式'" placement="bottom">
        <button
          class="theme-toggle"
          type="button"
          :aria-label="appStore.isDark ? '切换到明亮模式' : '切换到暗色模式'"
          @click="toggleTheme"
        >
          <el-icon>
            <Sunny v-if="appStore.isDark" />
            <Moon v-else />
          </el-icon>
        </button>
      </el-tooltip>

      <el-dropdown trigger="click">
        <span class="navbar__user">
          <el-avatar :size="30" :src="avatar || undefined" class="navbar__avatar">{{ avatarText }}</el-avatar>
          <span class="navbar__username">{{ displayName || email || '用户' }}</span>
          <el-icon class="navbar__arrow"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="User" @click="goProfile">个人信息</el-dropdown-item>
            <el-dropdown-item :icon="SwitchButton" divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--layout-sidebar-width);
  height: var(--layout-navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: left 0.2s;
  z-index: 9;
}

.navbar.is-collapsed {
  left: var(--layout-sidebar-collapsed-width);
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar__icon {
  font-size: 18px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: color 0.2s;
}

.navbar__icon:hover {
  color: var(--el-color-primary);
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar__user {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  outline: none;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--el-text-color-regular);
  cursor: pointer;
  font-size: 18px;
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.theme-toggle:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.theme-toggle:active {
  transform: scale(0.92);
}

.navbar__avatar {
  background: linear-gradient(135deg, #6c7cf0 0%, #ff8fb1 100%);
  color: #fff;
  font-weight: 600;
}

.navbar__username {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.navbar__arrow {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
