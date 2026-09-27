/**
 * home 域路由（见 ARCHITECTURE.md 第 4 节）
 */

import type { RouteRecordRaw } from 'vue-router'

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomePage.vue'),
    meta: {
      title: '主界面',
      subtitle: '任务概览与最近处理结果',
      tabLabel: '主页',
      icon: 'home',
      order: 10,
      menu: true,
      tab: true,
      keywords: ['home', '首页', '主页', '概览', '统计', 'dashboard'],
    },
  },
]