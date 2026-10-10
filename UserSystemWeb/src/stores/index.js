import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persist)

export default pinia

// 统一导出所有仓库，业务代码统一从 '@/stores' 引入
export * from './modules/app'
export * from './modules/user'
export * from './modules/permission'
