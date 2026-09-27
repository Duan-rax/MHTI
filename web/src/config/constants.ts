/**
 * 全局常量
 *
 * 集中管理跨域常量，避免魔法字符串。
 * 域内枚举请放 modules/<domain>/constants.ts。
 */

// =============================================================================
// 存储键名
// =============================================================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'session_id',
  EXPIRES_AT: 'expires_at',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  LOCALE: 'locale',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
