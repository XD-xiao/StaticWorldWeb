<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { addRole, updateRole } from '@/api/modules/admin'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // null 表示新增，否则为待编辑的角色对象
  data: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const formRef = ref()
const saving = ref(false)
const form = reactive({ roleName: '', roleKey: '' })

const isEdit = () => Boolean(props.data?.id)

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      form.roleName = props.data?.roleName || ''
      form.roleKey = props.data?.roleKey || ''
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isEdit()) {
      await updateRole({ roleId: props.data.id, roleName: form.roleName, roleKey: form.roleKey })
    } else {
      await addRole({ roleName: form.roleName, roleKey: form.roleKey })
    }
    ElMessage.success(isEdit() ? '修改角色成功' : '新增角色成功')
    emit('saved')
    close()
  } catch (e) {
    // 拦截器已统一提示
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit() ? '编辑角色' : '新增角色'"
    width="440px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="例如：超级管理员" maxlength="64" />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleKey">
        <el-input v-model="form.roleKey" placeholder="例如：admin（唯一）" maxlength="64" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
