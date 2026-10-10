import { fileURLToPath, URL } from 'node:url'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { pagePermissions, componentPermissions } from './src/permissions.js'

const SRC_DIR = fileURLToPath(new URL('./src', import.meta.url))

// 权限点：模块:实体:操作（至少三段、全小写），如 user:demo:add
const PERM_KEY_PATTERN = /^[a-z][a-z0-9]*(?::[a-z0-9]+){2,}$/
// 只认带引号的完整权限点：localhost:8080 这类两段串不会被误判
const PERM_KEY_RE = /['"]([a-z][a-z0-9]*(?::[a-z0-9]+){2,})['"]/g
// 清单文件自身不参与扫描（否则登记项会被当成"已使用"，死权限永远查不出来）
const REGISTRY_FILE = join(SRC_DIR, 'permissions.js')
const COMMENT_LINE_RE = /^\s*(\/\/|\*|\/\*|<!--)/

function collectFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) collectFiles(full, out)
    else if (/\.(vue|js)$/.test(entry.name)) out.push(full)
  }
  return out
}

// 扫描 src，返回 Map<权限点, 首次出现的 文件:行号>
function scanUsedPermissions() {
  const used = new Map()
  for (const file of collectFiles(SRC_DIR)) {
    if (file === REGISTRY_FILE) continue
    const at = relative(SRC_DIR, file).replace(/\\/g, '/')
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (COMMENT_LINE_RE.test(line)) return
        for (const [, key] of line.matchAll(PERM_KEY_RE)) {
          if (!used.has(key)) used.set(key, `${at}:${i + 1}`)
        }
      })
  }
  return used
}

// 权限清单插件：
//   dev   启动 / 热更新时审计，未登记与"已登记未使用"都提示（带 文件:行号）
//   build 审计（未登记直接失败）并导出 <outDir>/permissions.json
function permissionPlugin() {
  let logger = console
  let isBuild = false
  let root = process.cwd()
  let outDir = 'dist'
  let reported = false
  let auditFailed = false

  // 分组 → permType：1 页面，2 组件
  const registry = () => [
    ...pagePermissions.map((p) => ({ ...p, permType: 1 })),
    ...componentPermissions.map((p) => ({ ...p, permType: 2 }))
  ]

  function validate(items) {
    const keys = new Set()
    for (const { key } of items) {
      if (!PERM_KEY_PATTERN.test(key)) {
        throw new Error(`权限点格式不合法（应为 模块:实体:操作）：${key}`)
      }
      if (keys.has(key)) throw new Error(`权限点重复登记：${key}`)
      keys.add(key)
    }
    return keys
  }

  function audit({ fail, quiet }) {
    const items = registry()
    const keys = validate(items)
    const used = scanUsedPermissions()
    const missing = [...used].filter(([key]) => !keys.has(key))
    const dead = [...keys].filter((key) => !used.has(key))

    if (!quiet) {
      logger.info(`[permissions] 源码使用 ${used.size} 个权限点，已登记 ${keys.size} 个`)
    }
    if (missing.length) {
      // 报错信息不要再带 [permissions] 前缀：Vite 会按插件名自动加一次
      const message =
        `${missing.length} 个权限点未在 src/permissions.js 中登记：\n` +
        missing.map(([key, at]) => `  - ${key}  (${at})`).join('\n')
      if (fail) {
        auditFailed = true
        throw new Error(message)
      }
      logger.warn(`[permissions] ${message}`)
    }
    if (dead.length) {
      logger.warn(
        `[permissions] ${dead.length} 个已登记但源码未使用：\n` + dead.map((key) => `  - ${key}`).join('\n')
      )
    }
    if (!quiet && !missing.length && !dead.length) {
      logger.info('[permissions] 权限清单与源码一致 ✔')
    }
  }

  return {
    name: 'permissions',
    configResolved(config) {
      logger = config.logger
      isBuild = config.command === 'build'
      root = config.root
      outDir = config.build.outDir
    },
    buildStart() {
      audit({ fail: isBuild, quiet: reported })
      reported = true
    },
    handleHotUpdate({ file }) {
      if (!isBuild && file.startsWith(SRC_DIR)) audit({ fail: false, quiet: true })
    },
    closeBundle() {
      // 审计失败时不要导出（closeBundle 在构建失败后仍会被调用）
      if (!isBuild || auditFailed) return
      const list = registry().map(({ name, key, permType }) => ({ permName: name, permType, permKey: key }))
      const target = resolve(root, outDir)
      mkdirSync(target, { recursive: true })
      const file = join(target, 'permissions.json')
      writeFileSync(file, JSON.stringify(list, null, 2))
      logger.info(`[permissions] 已导出 ${list.length} 个权限点 -> ${file}`)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    permissionPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
