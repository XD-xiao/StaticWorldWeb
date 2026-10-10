# 用户系统（UserSystemWeb）

统一账户与权限管理的 Web 前端，提供登录注册、个人中心（个人信息 / 设备 / 登录日志 / 外观设置）以及后台管理（用户 / 角色 / 权限 / 设备）。

## 技术栈

| 依赖 | 说明 |
|---|---|
| Vue 3.5 | `<script setup>` 组合式 API |
| Vite 7 | 构建工具（Node `^20.19.0 \|\| >=22.12.0`） |
| Element Plus 2.11 | 按需引入 + 中文 locale |
| Pinia 3 | 状态仓库，配 `pinia-plugin-persistedstate` 持久化 |
| Vue Router 4 | `createWebHistory` + 全局权限守卫 |
| Axios 1 | 统一 `Result<T>` 解包、401 自动刷新、Blob 直通 |
| device-fingerprint-js | 设备指纹（登录采集与设备页展示） |

## 快速开始

```bash
npm install
npm run dev        # 启动开发服务器，控制台输出权限清单审计结果
npm run build      # 构建，并导出 dist/permissions.json 权限点清单
npm run preview    # 预览构建产物
```

后端接口地址在 `public/config.js` 中配置（`window.__APP_CONFIG__.API_BASE_URL`），打包后直接修改 `dist/config.js` 即可切换环境，无需重新构建。

## 目录结构

```
├── index.html              # 入口；含首屏外观配置内联脚本（防暗色闪白）
├── vite.config.js          # 别名、按需引入、权限清单插件（审计 + 导出）
├── public/config.js        # 运行时配置
└── src/
    ├── main.js             # 应用入口：pinia / router / 指令 / 暗色变量
    ├── App.vue             # ElConfigProvider（中文 locale）+ 路由出口
    ├── permissions.js      # ★ 权限清单唯一维护入口（零依赖，Node 侧加载）
    ├── api/
    │   ├── request.js      # axios 实例 + 拦截器（Result 解包 / 401 刷新 / Blob 直通）
    │   └── modules/        # 按域拆分的接口：auth / user / admin / device
    ├── components/
    │   ├── auth/           # 登录 / 注册表单
    │   └── admin/          # 后台抽屉与弹窗（角色分配、权限分配、日志、设备等）
    ├── composables/
    │   ├── useAuth.js      # 登录态统一读写入口（setAuth / clearAuth）
    │   └── usePermission.js# 权限查询（供 v-if / 脚本逻辑）
    ├── directives/
    │   └── permission.js   # v-permission 指令
    ├── layout/
    │   ├── index.vue       # 主布局（侧边栏 + 顶栏 + 内容区）
    │   ├── Sidebar.vue     # 侧边栏菜单
    │   ├── Navbar.vue      # 顶栏（折叠 / 用户 / 主题 / 登出）
    │   └── menu.js         # 菜单配置（含按权限过滤的 permission 字段）
    ├── router/
    │   ├── index.js        # 路由实例 + 全局守卫
    │   └── routes.js       # 路由表（constantRoutes / asyncRoutes）
    ├── stores/
    │   ├── index.js        # pinia 实例 + 持久化插件 + 统一导出
    │   └── modules/        # app（外观）/ user（token+用户信息）/ permission（权限点）
    ├── utils/
    │   ├── constants.js    # 全局常量（标题 / API 前缀 / 超时等）
    │   ├── enums.js        # 枚举字典（状态 / 类型 → 文案 / 标签色）
    │   ├── device.js       # 设备指纹 / 浏览器 / 时区 / 地理位置
    │   └── jwt.js          # JWT 解码、读取账号 ID
    └── views/
        ├── auth/           # 登录 / 注册页
        ├── account/        # 个人中心：profile / devices / logs / settings
        ├── admin/          # 后台管理：users / roles / permissions / devices
        └── error/          # 403 / 404
```

## 功能模块

### 登录与认证

- 支持**密码登录**与**邮箱验证码登录**，以及**注册**（邮箱 + 密码 + 验证码）。
- 登录成功回写 `accessToken` 与权限点，通过 `useAuth().setAuth()` 统一同步。
- 请求拦截器自动附加 `Authorization: Bearer <token>`；401 时先走**单例刷新**（并发 401 只刷新一次）重试，刷新失败清登录态并跳转 `/login`。
- 刷新接口 `POST /api/userservice/public/refresh` 无参数，身份来自 HttpOnly Cookie（`withCredentials: true`）。

### 个人中心（`/account/*`）

| 页面 | 说明 |
|---|---|
| 个人信息 | 查看 / 修改本人信息、上传头像 |
| 我的设备 | 查看本人设备、启用 / 禁用设备 |
| 登录日志 | 查看本人登录日志 |
| 外观设置 | 主题（亮 / 暗 / 跟随系统）、主题色与预设 |

### 后台管理（`/admin/*`，均需页面权限点）

| 页面 | 权限点 | 说明 |
|---|---|---|
| 用户管理 | `admin:user:page` | 用户列表、启停、分配角色、查看日志 / 设备 |
| 角色管理 | `admin:role:page` | 角色增删改、分配权限 |
| 权限管理 | `admin:perm:page` | 权限增删改 |
| 设备管理 | `admin:device:page` | 全量设备信息列表 |

## 权限体系

`src/permissions.js` 是权限点的唯一维护入口，分为两组，`permType` 由分组决定：

- `pagePermissions`：对应路由 `meta.permission`（`permType = 1`）
- `componentPermissions`：对应 `v-permission` 指令（`permType = 2`）

命名规范：`模块:实体:操作`，至少三段、全小写（如 `admin:user:page`）。

`vite.config.js` 的 `permissions` 插件负责审计与导出：

| 时机 | 行为 |
|---|---|
| `npm run dev` 启动 | 扫描 `src` 并与清单比对，未登记 / 已登记未使用都会告警（带 `文件:行号`） |
| 保存源文件 | 重新审计，只输出问题项 |
| `npm run build` | 未登记权限点 → 构建失败；否则导出 `<outDir>/permissions.json` |

导出格式（供后端初始化权限表）：

```json
[
  { "permName": "用户管理", "permType": 1, "permKey": "admin:user:page" }
]
```

### v-permission 指令

```vue
<!-- 拥有该权限点才显示 -->
<el-button v-permission="'admin:user:log'">查看日志</el-button>

<!-- 任一满足即显示 -->
<el-button v-permission="['admin:user:status', 'admin:user:log']">操作</el-button>

<!-- 需全部满足 -->
<el-button v-permission.all="['admin:user:log', 'admin:user:device']">查看</el-button>

<!-- 无权限时禁用而非隐藏 -->
<el-button v-permission.disable="'user:device:disable'">停用</el-button>
```

## 约定

- 一律使用 `@/` 别名引入 `src` 内模块。
- 需要页面权限的路由放 `asyncRoutes` 并标注 `meta.permission`；其余放 `constantRoutes`。
- 登录态只通过 `useAuth()` 读写，不在业务代码里直接操作 store 字段。
- 新增权限点必须登记到 `src/permissions.js`，否则构建会失败。
- 新增 store 时在 `stores/index.js` 统一导出，持久化 key 用 `app:` 前缀。
