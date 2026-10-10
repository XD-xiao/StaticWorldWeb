<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { Message as MessageIcon, Lock, Key } from '@element-plus/icons-vue'
import { getCode, register } from '@/api/modules/auth'

const emit = defineEmits(['success'])

const form = reactive({ email: '', password: '', confirmPassword: '', code: '' })
const formRef = ref()
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
let timer = null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateConfirm(rule, value, callback) {
  if (value !== form.password) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ],
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
    await getCode(form.email.trim(), 1)
    ElMessage.success('验证码已发送，请查收')
    startCountdown()
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    sending.value = false
  }
}

async function submit() {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    await register({ email: form.email.trim(), password: form.password, code: form.code })
    ElMessage.success('注册成功，请登录')
    emit('success')
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
  <div class="register-form">
    <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
      <el-form-item prop="email">
        <el-input
          v-model="form.email"
          placeholder="邮箱"
          clearable
          :prefix-icon="MessageIcon"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码（至少 6 位）"
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码"
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>

      <el-form-item prop="code">
        <div class="register-form__code">
          <el-input
            v-model="form.code"
            placeholder="验证码"
            maxlength="4"
            :prefix-icon="Key"
          />
          <el-button
            class="register-form__send"
            :disabled="countdown > 0 || sending"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-button class="register-form__submit" :loading="loading" @click="submit">
        注册
      </el-button>
    </el-form>
  </div>
</template>

<style scoped>
.register-form__code {
  display: flex;
  gap: 10px;
  width: 100%;
}

.register-form__send {
  flex-shrink: 0;
  white-space: nowrap;
}

.register-form__submit {
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

.register-form__submit:hover {
  opacity: 0.92;
  box-shadow: 0 12px 32px rgba(108, 124, 240, 0.35);
}
</style>
