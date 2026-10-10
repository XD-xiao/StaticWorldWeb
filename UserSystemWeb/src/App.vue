<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores'

// 初始化外观 store，使主题模式 / 主题色 / 淡色背景作用于根节点 CSS 变量。
useAppStore()
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
