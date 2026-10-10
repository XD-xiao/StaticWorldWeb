<script setup>
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const mode = ref('login')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}
</script>

<template>
  <div class="auth">
    <div class="auth__brand">
      <div class="auth__brand-inner">
        <div class="auth__logo">US</div>
        <h1 class="auth__title">用户中心</h1>
        <p class="auth__slogan">统一身份认证 · 安全登录</p>
      </div>
    </div>

    <div class="auth__panel">
      <div class="auth__card">
        <div class="auth__card-head">
          <h2 class="auth__card-title">{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</h2>
          <p class="auth__card-sub">
            {{ mode === 'login' ? '登录以继续访问用户中心' : '填写以下信息完成注册' }}
          </p>
        </div>

        <LoginForm v-if="mode === 'login'" />
        <RegisterForm v-else @success="mode = 'login'" />

        <div class="auth__switch">
          <span>{{ mode === 'login' ? '还没有账号？' : '已有账号？' }}</span>
          <el-button link type="primary" @click="toggleMode">
            {{ mode === 'login' ? '去注册' : '去登录' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: flex;
}

/* 左侧品牌区 */
.auth__brand {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #fff;
  background: linear-gradient(135deg, #6c7cf0 0%, #8b5cf6 100%);
  overflow: hidden;
}

.auth__brand::before,
.auth__brand::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.auth__brand::before {
  width: 340px;
  height: 340px;
  top: -100px;
  right: -100px;
}

.auth__brand::after {
  width: 260px;
  height: 260px;
  bottom: -80px;
  left: -80px;
  background: rgba(255, 255, 255, 0.08);
}

.auth__brand-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.auth__logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(4px);
}

.auth__title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.auth__slogan {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 右侧表单区 */
.auth__panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--el-bg-color-page);
}

.auth__card {
  width: 100%;
  max-width: 400px;
  padding: 36px 32px 24px;
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 12px 32px rgba(31, 45, 61, 0.08);
}

.auth__card-head {
  margin-bottom: 24px;
}

.auth__card-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.auth__card-sub {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 登录 / 注册切换：右下角 */
.auth__switch {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 20px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.auth__switch :deep(.el-button) {
  padding: 0 4px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .auth__brand {
    display: none;
  }
}
</style>
