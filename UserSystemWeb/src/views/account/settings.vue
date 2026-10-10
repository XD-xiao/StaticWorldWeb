<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { useAppStore, PRESETS } from '@/stores'

const appStore = useAppStore()

const themeOptions = [
  { label: '明亮', value: 'light' },
  { label: '暗色', value: 'dark' },
  { label: '跟随系统', value: 'auto' }
]

const colorFields = [
  { key: 'primaryColor', label: '主题色', desc: '按钮、高亮、选中态等主色调' },
  { key: 'bgColor', label: '页面背景', desc: '页面底色（淡色）' },
  { key: 'surfaceColor', label: '面板背景', desc: '导航栏、卡片、抽屉、对话框' },
  { key: 'overlayColor', label: '弹层背景', desc: '下拉菜单、气泡、日期选择器' }
]

// 手动修改颜色即视为自定义方案，取消预设高亮
function markCustom() {
  appStore.presetKey = ''
}

async function reset() {
  try {
    await ElMessageBox.confirm('恢复默认外观设置？', '提示', {
      confirmButtonText: '恢复',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  appStore.reset()
  ElMessage.success('已恢复默认')
}
</script>

<template>
  <div class="account-page">

    <el-card shadow="never" class="account-card">
      <div class="settings">
        <section class="settings__section">
          <h3 class="settings__title">主题模式</h3>
          <el-radio-group v-model="appStore.theme">
            <el-radio-button v-for="t in themeOptions" :key="t.value" :value="t.value">
              {{ t.label }}
            </el-radio-button>
          </el-radio-group>
        </section>

        <el-divider />

        <section class="settings__section">
          <h3 class="settings__title">配色预设</h3>
          <p class="settings__hint">一键应用协调的主题色与淡色背景</p>
          <div class="preset-grid">
            <button
              v-for="p in PRESETS"
              :key="p.key"
              type="button"
              class="preset-card"
              :class="{ active: appStore.presetKey === p.key }"
              @click="appStore.applyPreset(p.key)"
            >
              <span class="preset-card__swatch" :style="{ background: p.bg }">
                <i class="preset-card__swatch-accent" :style="{ background: p.primary }" />
              </span>
              <span class="preset-card__name">{{ p.name }}</span>
              <span v-if="appStore.presetKey === p.key" class="preset-card__check">✓</span>
            </button>
          </div>
        </section>

        <el-divider />

        <section class="settings__section">
          <h3 class="settings__title">自定义颜色</h3>
          <p class="settings__hint">手动选择颜色后将切换为自定义方案</p>
          <div class="color-fields">
            <div v-for="f in colorFields" :key="f.key" class="color-field">
              <div class="color-field__label">
                <span>{{ f.label }}</span>
                <span class="color-field__desc">{{ f.desc }}</span>
              </div>
              <el-color-picker v-model="appStore[f.key]" @change="markCustom" />
            </div>
          </div>
        </section>

        <el-divider />

        <div class="settings__foot">
          <el-button @click="reset">恢复默认</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.account-page {
  max-width: 860px;
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

.settings {
  padding: 8px 4px;
}

.settings__section {
  padding: 4px 0;
}

.settings__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.settings__hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.preset-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 124, 240, 0.12);
}

.preset-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.preset-card__swatch {
  position: relative;
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.preset-card__swatch-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
}

.preset-card__name {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.preset-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  color: #fff;
  background: var(--el-color-primary);
}

.color-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
}

.color-field__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.color-field__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.settings__foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

@media (max-width: 640px) {
  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
