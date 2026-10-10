<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { addPermission, updatePermission } from '@/api/modules/admin'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // null 表示新增，否则为待编辑的权限对象
  data: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const formRef = ref()
const saving = ref(false)
const form = reactive({ permName: '', permKey: '', permType: 1, path: '' })

const isEdit = () => Boolean(props.data?.id)

const rules = {
  permName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  permKey: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  permType: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      form.permName = props.data?.permName || ''
      form.permKey = props.data?.permKey || ''
      form.permType = props.data?.permType ?? 1
      form.path = props.data?.path || ''
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
    const payload = { permName: form.permName, permKey: form.permKey, permType: form.permType }
    if (form.path) payload.path = form.path

    if (isEdit()) {
      await updatePermission({ id: props.data.id, ...payload })
    } else {
      await addPermission(payload)
    }
    ElMessage.success(isEdit() ? '修改权限成功' : '新增权限成功')
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
    :title="isEdit() ? '编辑权限' : '新增权限'"
    width="480px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="权限名称" prop="permName">
        <el-input v-model="form.permName" placeholder="例如：用户管理" maxlength="64" />
      </el-form-item>
      <el-form-item label="权限标识" prop="permKey">
        <el-input v-model="form.permKey" placeholder="例如：admin:user:page" maxlength="128" />
      </el-form-item>
      <el-form-item label="权限类型" prop="permType">
        <el-radio-group v-model="form.permType">
          <el-radio :value="1">页面</el-radio>
          <el-radio :value="2">组件</el-radio>
          <el-radio :value="3">接口</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="路径" prop="path">
        <el-input v-model="form.path" placeholder="页面路由或接口路径（可选）" maxlength="255" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
