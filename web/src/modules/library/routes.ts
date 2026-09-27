/**
 * library 域路由（见 ARCHITECTURE.md 第 4 节）
 */

import type { RouteRecordRaw } from 'vue-router'

export const libraryRoutes: RouteRecordRaw[] = [
  {
    path: '/files',
    name: 'files',
    component: () => import('./views/FilesPage.vue'),
    meta: {
      title: '文件管理',
      subtitle: '浏览和管理媒体文件',
      tabLabel: '文件',
      icon: 'library',
      order: 40,
      menu: true,
      tab: true,
      keywords: ['files', '文件', '目录', '浏览', 'library', 'filemanager'],
    },
  },
  {
    path: '/filemanager/scan',
    name: 'file-scan',
    component: () => import('./views/FileScanPage.vue'),
    meta: { title: '文件扫描', menu: false },
  },
]