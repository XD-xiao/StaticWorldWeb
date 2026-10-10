import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'

const DEFAULT_PRIMARY = '#6C7CF0'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const HEX = /^#[0-9a-f]{6}$/i

// 外观预设：主题色 + 页面背景（淡色）+ 面板背景 + 弹层背景
export const PRESETS = [
  { key: 'indigo', name: '暮蓝', primary: '#6C7CF0', bg: '#ECEEFA', surface: '#F6F7FE', overlay: '#FCFCFF' },
  { key: 'lavender', name: '雾紫', primary: '#8B5CF6', bg: '#F1EDFB', surface: '#F8F6FE', overlay: '#FDFCFF' },
  { key: 'sky', name: '晨青', primary: '#0EA5E9', bg: '#EBF5FB', surface: '#F5FAFE', overlay: '#FBFDFF' },
  { key: 'rose', name: '樱粉', primary: '#EC4899', bg: '#FBEEF4', surface: '#FEF6FA', overlay: '#FFFBFD' },
  { key: 'amber', name: '暖橙', primary: '#F59E0B', bg: '#FBF3E7', surface: '#FEFAF2', overlay: '#FFFDF8' },
  { key: 'emerald', name: '森绿', primary: '#10B981', bg: '#ECF7F2', surface: '#F5FBF8', overlay: '#FBFEFC' }
]

export const useAppStore = defineStore('app', () => {
  const theme = ref('light') // light | dark | auto
  const primaryColor = ref(DEFAULT_PRIMARY)
  const bgColor = ref(PRESETS[0].bg)
  const surfaceColor = ref(PRESETS[0].surface)
  const overlayColor = ref(PRESETS[0].overlay)
  const presetKey = ref('indigo')

  // auto 模式跟随系统
  const prefersDark = ref(false)
  const media = window.matchMedia?.(DARK_QUERY)
  if (media) {
    prefersDark.value = media.matches
    media.addEventListener('change', (e) => {
      prefersDark.value = e.matches
    })
  }

  const isDark = computed(() => theme.value === 'dark' || (theme.value === 'auto' && prefersDark.value))

  // 主题作用于根节点；主题色与淡色背景按 Element Plus 变量规则派生/映射
  watchEffect(() => {
    const el = document.documentElement
    el.classList.toggle('dark', isDark.value)

    const color = HEX.test(primaryColor.value) ? primaryColor.value : DEFAULT_PRIMARY
    el.style.setProperty('--el-color-primary', color)
    for (const level of [3, 5, 7, 8, 9]) {
      el.style.setProperty(`--el-color-primary-light-${level}`, mix(color, '#ffffff', level / 10))
    }
    el.style.setProperty('--el-color-primary-dark-2', mix(color, '#000000', 0.2))

    // 淡色背景仅作用于亮色；暗色回退到 Element Plus 暗色变量
    if (isDark.value) {
      el.style.removeProperty('--el-bg-color')
      el.style.removeProperty('--el-bg-color-page')
      el.style.removeProperty('--el-bg-color-overlay')
    } else {
      el.style.setProperty('--el-bg-color', HEX.test(surfaceColor.value) ? surfaceColor.value : '#ffffff')
      el.style.setProperty('--el-bg-color-page', HEX.test(bgColor.value) ? bgColor.value : '#f2f3f5')
      el.style.setProperty('--el-bg-color-overlay', HEX.test(overlayColor.value) ? overlayColor.value : '#ffffff')
    }
  })

  function applyPreset(key) {
    const p = PRESETS.find((x) => x.key === key)
    if (!p) return
    primaryColor.value = p.primary
    bgColor.value = p.bg
    surfaceColor.value = p.surface
    overlayColor.value = p.overlay
    presetKey.value = p.key
  }

  const reset = () => {
    theme.value = 'light'
    applyPreset('indigo')
  }

  return { theme, primaryColor, bgColor, surfaceColor, overlayColor, presetKey, isDark, applyPreset, reset }
}, {
  persist: {
    key: 'app:config'
  }
})

// 两个十六进制颜色按比例混合（weight 为 to 的占比）
function mix(from, to, weight) {
  const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [r1, g1, b1] = parse(from)
  const [r2, g2, b2] = parse(to)
  const channel = (a, b) => Math.round(a * (1 - weight) + b * weight).toString(16).padStart(2, '0')
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`
}
