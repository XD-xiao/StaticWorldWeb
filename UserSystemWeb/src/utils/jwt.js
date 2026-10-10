// JWT 解码工具：从 accessToken 的 claims 中读取当前登录账号 ID
// 后端将账号 ID 写入 JWT（claim 名 account_id），用于「获取本人信息」回显。

// 解码 JWT payload（仅读取明文 claims，不做签名校验）
export function decodeJwtPayload(token) {
  if (!token) return null
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

// 提取账号 ID（兼容 account_id / accountId / userId / sub 等常见 claim 名）
export function getAccountId(token) {
  const payload = decodeJwtPayload(token)
  if (!payload) return ''
  return payload.account_id ?? payload.accountId ?? payload.userId ?? payload.sub ?? ''
}
