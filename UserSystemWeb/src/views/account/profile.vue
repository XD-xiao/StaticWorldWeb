<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { getUserInfo, updateMyInfo, uploadAvatar } from '@/api/modules/user'
import { useAuth } from '@/composables/useAuth'
import { getAccountId } from '@/utils/jwt'

const { token } = useAuth()
const userId = computed(() => getAccountId(token.value))

const form = reactive({ nickname: '', avatar: '', gender: 0, birthday: '', bio: '' })
// 进入编辑态前的快照，用于「取消」时还原
const snapshot = reactive({ nickname: '', avatar: '', gender: 0, birthday: '', bio: '' })

const email = ref('')
const loading = ref(false)
const saving = ref(false)
const editing = ref(false)

const avatarFile = ref(null) // 待上传的图片文件
const avatarPreview = ref('') // 本地预览（objectURL）
const dialogVisible = ref(false)
const uploadRef = ref(null)

const avatarText = computed(() => (form.nickname || email.value || 'U').slice(0, 1).toUpperCase())
const displayAvatar = computed(() => avatarPreview.value || form.avatar || '')
const genderText = computed(() => ({ 0: '未知', 1: '男', 2: '女' }[form.gender] ?? '未知'))

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']

function assignInfo(info) {
  email.value = info.email || ''
  form.nickname = info.nickname || ''
  form.avatar = info.avatar || ''
  form.gender = info.gender ?? 0
  form.birthday = info.birthday || ''
  form.bio = info.bio || ''
  Object.assign(snapshot, form)
}

async function load() {
  if (!userId.value) {
    ElMessage.warning('无法获取当前用户 ID，请重新登录')
    return
  }
  loading.value = true
  try {
    const res = await getUserInfo(userId.value)
    if (res?.data) assignInfo(res.data)
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    loading.value = false
  }
}

function startEdit() {
  Object.assign(form, snapshot)
  clearAvatarSelection()
  editing.value = true
}

function cancelEdit() {
  Object.assign(form, snapshot)
  clearAvatarSelection()
  editing.value = false
}

function clearAvatarSelection() {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = ''
  avatarFile.value = null
  uploadRef.value?.clearFiles()
}

function handleAvatarChange(uploadFile) {
  const file = uploadFile?.raw
  uploadRef.value?.clearFiles()
  if (!file) return
  if (!ACCEPTED_TYPES.includes(file.type)) {
    ElMessage.error('请选择 jpg/png/gif/webp/bmp 格式的图片')
    return
  }
  if (file.size > MAX_AVATAR_SIZE) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

function openAvatar() {
  if (!form.avatar) return
  dialogVisible.value = true
}

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    let avatarUrl = form.avatar
    if (avatarFile.value) {
      const fd = new FormData()
      fd.append('file', avatarFile.value)
      const res = await uploadAvatar(fd)
      avatarUrl = res?.data?.url || form.avatar
      form.avatar = avatarUrl
    }

    // 仅提交非空字段（gender 恒为 0/1/2，始终提交）
    const payload = { gender: form.gender }
    if (form.nickname !== '') payload.nickname = form.nickname
    if (avatarUrl) payload.avatar = avatarUrl
    if (form.birthday !== '') payload.birthday = form.birthday
    if (form.bio !== '') payload.bio = form.bio

    await updateMyInfo(payload)

    Object.assign(snapshot, form)
    clearAvatarSelection()
    editing.value = false
    ElMessage.success('保存成功')
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    saving.value = false
  }
}

onMounted(load)
onBeforeUnmount(clearAvatarSelection)
</script>

<template>
  <div class="account-page">


    <el-card shadow="never" class="account-card">
      <el-skeleton v-if="loading" :rows="6" animated />

      <!-- 查看态 -->
      <div v-else-if="!editing" class="profile-view">
        <div class="avatar-wrap" :class="{ 'is-clickable': !!form.avatar }" @click="openAvatar">
          <el-avatar :size="96" :src="form.avatar || undefined">{{ avatarText }}</el-avatar>
          <span v-if="form.avatar" class="avatar-hint">点击查看大图</span>
        </div>

        <div class="profile-name">{{ form.nickname || '未设置昵称' }}</div>
        <div class="profile-email">{{ email || '—' }}</div>

        <el-divider />

        <dl class="info-list">
          <div class="info-item">
            <dt>性别</dt>
            <dd>{{ genderText }}</dd>
          </div>
          <div class="info-item">
            <dt>生日</dt>
            <dd>{{ form.birthday || '未填写' }}</dd>
          </div>
          <div class="info-item info-item--full">
            <dt>签名</dt>
            <dd>{{ form.bio || '未填写' }}</dd>
          </div>
        </dl>

        <div class="actions">
          <el-button v-permission="'user:profile:edit'" type="primary" round @click="startEdit">
            修改资料
          </el-button>
        </div>
      </div>

      <!-- 编辑态 -->
      <el-form v-else :model="form" label-width="70px" class="profile-form">
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
          :on-change="handleAvatarChange"
          :disabled="saving"
        >
          <div class="avatar-edit">
            <el-avatar :size="96" :src="displayAvatar || undefined">{{ avatarText }}</el-avatar>
            <span class="avatar-edit__hint">点击更换头像</span>
          </div>
        </el-upload>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio :value="0">未知</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择生日"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签名">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="介绍一下自己吧"
          />
        </el-form-item>
        <el-form-item>
          <div class="actions actions--form">
            <el-button
              v-permission="'user:profile:edit'"
              type="primary"
              :loading="saving"
              @click="save"
            >
              保存
            </el-button>
            <el-button :disabled="saving" @click="cancelEdit">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 头像放大预览 -->
    <el-dialog v-model="dialogVisible" title="头像预览" width="420px" align-center append-to-body>
      <div class="avatar-preview-box">
        <img :src="form.avatar" alt="头像" />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.account-page {
  max-width: 720px;
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

/* 查看态 */
.profile-view {
  padding: 36px 32px 28px;
  text-align: center;
}

.avatar-wrap {
  position: relative;
  display: inline-block;
}

.avatar-wrap.is-clickable {
  cursor: pointer;
}

.avatar-wrap :deep(.el-avatar),
.avatar-edit :deep(.el-avatar) {
  border: 3px solid var(--el-bg-color);
  box-shadow: 0 8px 20px rgba(31, 45, 61, 0.12);
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: 30px;
  transition: transform 0.2s ease;
}

.avatar-wrap.is-clickable:hover :deep(.el-avatar) {
  transform: scale(1.04);
}

.avatar-hint {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
  padding: 3px 12px;
  font-size: 12px;
  line-height: 1.4;
  color: #fff;
  background: rgba(31, 45, 61, 0.68);
  border-radius: 999px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.avatar-wrap:hover .avatar-hint {
  opacity: 1;
}

.profile-name {
  margin-top: 22px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-email {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.info-list {
  margin: 4px 0 0;
  padding: 0;
  text-align: left;
}

.info-item {
  display: flex;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item--full {
  border-bottom: none;
}

.info-item dt {
  width: 72px;
  flex-shrink: 0;
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.info-item dd {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.info-item--full dd {
  white-space: pre-wrap;
}

.actions {
  margin-top: 24px;
  text-align: right;
}

/* 编辑态 */
.profile-form {
  max-width: 520px;
  margin: 0 auto;
  padding: 36px 28px 8px;
}

.avatar-uploader {
  text-align: center;
  margin-bottom: 28px;
}

.avatar-edit {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar-edit__hint {
  font-size: 12px;
  color: var(--el-color-primary);
}

.actions--form {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  margin-top: 0;
}

/* 头像预览弹窗 */
.avatar-preview-box {
  display: flex;
  justify-content: center;
}

.avatar-preview-box img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 12px;
}

@media (prefers-reduced-motion: reduce) {
  .avatar-wrap.is-clickable:hover :deep(.el-avatar) {
    transform: none;
  }

  .avatar-hint,
  .avatar-wrap :deep(.el-avatar),
  .avatar-edit :deep(.el-avatar) {
    transition: none;
  }
}
</style>
