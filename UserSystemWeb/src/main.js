import { createApp } from 'vue'
import pinia from '@/stores/index'

import App from './App.vue'
import router from './router'
import permission from '@/directives/permission'

// Element Plus 暗色主题 CSS 变量（配合 html.dark 类切换夜间模式）
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.directive('permission', permission)

app.mount('#app')
