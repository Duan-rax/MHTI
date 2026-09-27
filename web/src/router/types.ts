/**
 * 路由 meta 类型规范
 *
 * 见 web/ARCHITECTURE.md 第 4 节。所有页面必须声明 title，
 * 一级菜单使用 order/icon/tab，隐藏页用 menu: false。
 */

import type { IconKey } from './icons'

export interface AppRouteMeta {
  /** 页面标题：文档标题 / 导航 / 页头 */
  title: string
  /** 页头副标题 */
  subtitle?: string
  /** 导航图标键（见 icons.ts 注册表） */
  icon?: IconKey
  /** 一级导航排序（10/20/30…） */
  order?: number
  /** 是否进顶部主导航 */
  menu?: boolean
  /** 是否进移动端底部 TabBar */
  tab?: boolean
  /** TabBar 短标签（缺省用 title） */
  tabLabel?: string
  /** 命令面板（⌘K）检索关键词：补标题里没有的俗称与英文名 */
  keywords?: string[]
  /** 免登录白名单 */
  public?: boolean
  /** 无布局壳（全页） */
  fullPage?: boolean
  /** 权限标识（后端暂无权限模型：占位，守卫只断言不拦截） */
  permission?: string
  /** 页签缓存键（本轮只声明不启用 keep-alive） */
  cache?: string
  /** 固定页签占位（同上，不启用） */
  affix?: boolean
}

declare module 'vue-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RouteMeta extends AppRouteMeta {}
}