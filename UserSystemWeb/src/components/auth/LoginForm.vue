<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { Message as MessageIcon, Lock, Key } from '@element-plus/icons-vue'
import { getCode, loginByPassword, loginByCode } from '@/api/modules/auth'
import { useAuth } from '@/composables/useAuth'
import { ensureDeviceId, parseBrowser, getTimezone, getGeolocation } from '@/utils/device'

const route = useRoute()
const router = useRouter()
const { setAuth } = useAuth()

const tab = ref('password')
const form = reactive({ email: '', password: '', code: '' })
const formRef = ref()
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
let timer = null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

function startCountdown() {
  countdown.value = 50
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function sendCode() {
  if (!EMAIL_RE.test(form.email)) {
    ElMessage.warning('请先输入正确的邮箱')
    return
  }
  sending.value = true
  try {
    await getCode(form.email.trim(), 2)
    ElMessage.success('验证码已发送，请查收')
    startCountdown()
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    sending.value = false
  }
}

function detectDeviceType(ua) {
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function categoryOf(type) {
  return { Desktop: '桌面端', Mobile: '移动设备', Tablet: '平板设备' }[type] || '桌面端'
}

function getOsInfo(ua) {
  const rules = [
    [/Windows NT ([\d.]+)/, 'Windows'],
    [/Mac OS X ([\d_.]+)/, 'macOS'],
    [/Android ([\d.]+)/, 'Android'],
    [/iPhone OS ([\d_.]+)/, 'iOS'],
    [/iPad.*OS ([\d_.]+)/, 'iPadOS'],
    [/CrOS ([\d.]+)/, 'Chrome OS'],
    [/Linux/, 'Linux']
  ]
  for (const [re, name] of rules) {
    const m = ua.match(re)
    if (m) {
      let version = m[1] || ''
      if (['macOS', 'iOS', 'iPadOS'].includes(name)) version = version.replace(/_/g, '.')
      return { name, version }
    }
  }
  return { name: '未知', version: '' }
}

async function buildDevicePayload() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const { version: browserVersion } = parseBrowser(ua)
  const fingerprint = await ensureDeviceId()
  const deviceType = detectDeviceType(ua)
  const os = getOsInfo(ua)
  const geo = await getGeolocation()
  return {
    fingerprint,
    deviceType,
    deviceCategory: categoryOf(deviceType),
    osName: os.name,
    osVersion: os.version,
    browserVersion,
    userAgent: ua,
    timezone: getTimezone(),
    latitude: geo?.latitude,
    longitude: geo?.longitude
  }
}

async function submit() {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    const device = await buildDevicePayload()
    const browserName = parseBrowser().name
    const base = { email: form.email.trim(), ...device }
    const res =
      tab.value === 'password'
        ? await loginByPassword({ ...base, password: form.password, browser: browserName })
        : await loginByCode({ ...base, code: form.code, browserName })

    setAuth(res?.data || {})
    ElMessage.success('登录成功')

    const { redirect } = route.query
    router.replace(typeof redirect === 'string' && redirect ? redirect : '/')
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="login-form">
    <div class="login-form__tabs">
      <span
        class="login-form__tab"
        :class="{ active: tab === 'password' }"
        @click="tab = 'password'"
      >密码登录</span>
      <span
        class="login-form__tab"
        :class="{ active: tab === 'code' }"
        @click="tab = 'code'"
      >验证码登录</span>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
      <el-form-item prop="email">
        <el-input
          v-model="form.email"
          placeholder="邮箱"
          clearable
          :prefix-icon="MessageIcon"
        />
      </el-form-item>

      <el-form-item v-if="tab === 'password'" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          show-password
          :prefix-icon="Lock"
          @keyup.enter="submit"
        />
      </el-form-item>

      <el-form-item v-else prop="code">
        <div class="login-form__code">
          <el-input
            v-model="form.code"
            placeholder="验证码"
            maxlength="4"
            :prefix-icon="Key"
            @keyup.enter="submit"
          />
          <el-button
            class="login-form__send"
            :disabled="countdown > 0 || sending"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-button class="login-form__submit" :loading="loading" @click="submit">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<style scoped>
.login-form__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
}

.login-form__tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  transition: all 0.2s;
}

.login-form__tab.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(135deg, #6c7cf0 0%, #8b5cf6 100%);
}

.login-form__code {
  display: flex;
  gap: 10px;
  width: 100%;
}

.login-form__send {
  flex-shrink: 0;
  white-space: nowrap;
}

.login-form__submit {
  width: 100%;
  height: 44px;
  margin-top: 4px;
  border: none !important;
  border-radius: 10px;
  background: linear-gradient(135deg, #6c7cf0 0%, #8b5cf6 100%) !important;
  color: #fff !important;
  font-size: 15px;
  font-weight: 600;
}

.login-form__submit:hover {
  opacity: 0.92;
  box-shadow: 0 12px 32px rgba(108, 124, 240, 0.35);
}
</style>
