/**
 * scrape 域路由（见 ARCHITECTURE.md 第 4 节）
 */

import type { RouteRecordRaw } from 'vue-router'

export const scrapeRoutes: RouteRecordRaw[] = [
  {
    path: '/scan',
    name: 'scan',
    component: () => import('./views/ScanPage.vue'),
    meta: {
      title: '手动任务',
      subtitle: '创建和管理刮削任务',
      tabLabel: '任务',
      icon: 'scrape',
      order: 20,
      menu: true,
      tab: true,
      keywords: ['scan', 'scrape', '刮削', '任务', '新建任务', 'manual'],
    },
  },
]