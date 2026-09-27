/**
 * auth 域路由（见 ARCHITECTURE.md 第 4 节）
 *
 * 登录为全页路由（顶层，不套壳）；安全设置为壳内隐藏页（meta.menu=false，
 * 仅由用户菜单与命令面板进入）。
 */

import type { RouteRecordRaw } from 'vue-router'

/** 壳内路由：安全设置（不进主导航） */
export const authShellRoutes: RouteRecordRaw[] = [
  {
    path: '/security',
    name: 'security',
    component: () => import('./views/SecurityPage.vue'),
    meta: {
      title: '安全设置',
      subtitle: '管理账户和访问权限',
      icon: 'security',
      order: 60,
      menu: false,
      keywords: ['security', '安全', '账户', '密码', '会话', '登录历史'],
    },
  },
]

/** 全页路由（无布局壳）：登录页 */
export const authStandaloneRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginPage.vue'),
    meta: { title: '登录', public: true, fullPage: true },
  },
]

export const authRoutes: RouteRecordRaw[] = [...authShellRoutes, ...authStandaloneRoutes]