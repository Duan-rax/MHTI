/**
 * settings 域路由（见 ARCHITECTURE.md 第 4 节）
 */

import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./views/SettingsPage.vue'),
    meta: {
      title: '设置',
      subtitle: '配置应用参数',
      tabLabel: '设置',
      icon: 'settings',
      order: 50,
      menu: true,
      tab: true,
      keywords: ['settings', '配置', '参数', 'tmdb', '115', 'emby'],
    },
  },
]