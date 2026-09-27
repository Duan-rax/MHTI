/**
 * 路由表：布局壳 + 各业务域路由
 *
 * 结构（见 ARCHITECTURE.md 第 4 节）：
 * - 全页路由（登录）挂顶层，meta.fullPage + public，不进壳
 * - 其余全部作为布局壳 AppLayout 的 children（嵌套路由）
 *
 * URL 契约：路径与重构前**完全一致**（含 /filemanager/scan 遗留路径），
 * 避免书签与外部链接失效。新页面才使用统一 meta 规范。
 *
 * 各域 routes.ts 在阶段 2-7 逐域迁出后，此处改为聚合 import。
 */

import type { RouteRecordRaw } from 'vue-router'
import { authShellRoutes, authStandaloneRoutes } from '@/modules/auth'
import { homeRoutes } from '@/modules/home'
import { scrapeRoutes } from '@/modules/scrape'
import { historyRoutes } from '@/modules/history'
import { libraryRoutes } from '@/modules/library'
import { settingsRoutes } from '@/modules/settings'

/** 布局壳子路由（进菜单的项按 order 排序，见 menu.ts） */
export const shellChildren: RouteRecordRaw[] = [
  ...authShellRoutes,
  ...homeRoutes,
  ...scrapeRoutes,
  ...historyRoutes,
  ...libraryRoutes,
  ...settingsRoutes,
]

/** 布局壳路由（AppLayout 作父级） */
export const shellRoute: RouteRecordRaw = {
  path: '/',
  component: () => import('@/layouts/AppLayout.vue'),
  children: shellChildren,
}

/** 全页路由（不套壳） */
export const standaloneRoutes: RouteRecordRaw[] = [...authStandaloneRoutes]

export const routes: RouteRecordRaw[] = [shellRoute, ...standaloneRoutes]