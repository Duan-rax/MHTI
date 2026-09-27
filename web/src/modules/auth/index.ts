/**
 * auth 模块公开导出（唯一对外入口，见 ARCHITECTURE.md 第 3 节）
 *
 * 外部只准从这里导入；禁止深路径访问本模块内部。
 */

export { default as AdminConfigDrawer } from './components/AdminConfigDrawer.vue'
export { authRoutes, authShellRoutes, authStandaloneRoutes } from './routes'
export { authApi, expireOptions } from './api'
export type {
  ExpireOption,
  LoginRequest,
  RegisterRequest,
  SessionInfo,
  LoginHistoryItem,
  UserProfile,
  ChangePasswordRequest,
  UpdateUsernameRequest,
} from './api'