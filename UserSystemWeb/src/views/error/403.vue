<script setup>
import { useRouter } from 'vue-router'
import { usePermission } from '@/composables/usePermission'

const router = useRouter()
const { permissions } = usePermission()
</script>

<template>
  <div class="error-page">
    <el-result icon="warning" title="403" sub-title="当前账号没有访问该页面的权限">
      <template #extra>
        <el-space direction="vertical">
          <p class="tip">当前权限点：{{ permissions.length ? permissions.join('、') : '（空）' }}</p>
          <el-button type="primary" @click="router.replace('/')">返回首页</el-button>
        </el-space>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page {
  padding: 48px 16px;
}

.tip {
  color: #888;
  font-size: 13px;
  margin: 0;
}
</style>
