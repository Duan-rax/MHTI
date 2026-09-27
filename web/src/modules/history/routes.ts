/**
 * history 域路由（见 ARCHITECTURE.md 第 4 节）
 */

import type { RouteRecordRaw } from 'vue-router'

export const historyRoutes: RouteRecordRaw[] = [
  {
    path: '/history',
    name: 'history',
    component: () => import('./views/HistoryPage.vue'),
    meta: {
      title: '刮削记录',
      subtitle: '查看历史刮削结果',
      tabLabel: '记录',
      icon: 'history',
      order: 30,
      menu: true,
      tab: true,
      keywords: ['history', '记录', '历史'],
    },
  },
  {
    path: '/history/:id',
    name: 'history-detail',
    component: () => import('./views/HistoryDetailPage.vue'),
    meta: { title: '记录详情', menu: false },
  },
]