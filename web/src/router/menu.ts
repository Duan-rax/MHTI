/**
 * 导航项生成（由路由 meta 驱动，见 ARCHITECTURE.md 第 4 节）
 *
 * 唯一真源是各域 routes.ts 的路由 meta —— 顶部主导航、移动端 TabBar、
 * 命令面板均由此派生，不再有任何硬编码菜单。
 */

import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { shellChildren } from './shell'
import { ICONS } from './icons'
import type { AppRouteMeta } from './types'

/** 取路由 meta（缺省为空对象，显式类型避免联合类型退化） */
function metaOf(record: RouteRecordRaw): Partial<AppRouteMeta> {
  return (record.meta ?? {}) as Partial<AppRouteMeta>
}

export interface MenuEntry {
  /** 路由 path（导航 key） */
  path: string
  title: string
  subtitle?: string
  /** TabBar 短标签（缺省用 title） */
  tabLabel?: string
  icon?: Component
  iconActive?: Component
  /** 命令面板检索关键词 */
  keywords?: string[]
}

function entries(predicate: (r: RouteRecordRaw) => boolean, sortByOrder: boolean): MenuEntry[] {
  const list = shellChildren.filter(
    (r) =>
      typeof r.path === 'string' &&
      r.path.startsWith('/') &&
      !r.path.includes(':') &&
      predicate(r),
  )
  if (sortByOrder) {
    list.sort((a, b) => (metaOf(a).order ?? 999) - (metaOf(b).order ?? 999))
  }
  return list.map((r) => {
    const meta = metaOf(r)
    const icons = meta.icon ? ICONS[meta.icon] : undefined
    return {
      path: r.path as string,
      title: meta.title ?? '',
      subtitle: meta.subtitle,
      tabLabel: meta.tabLabel,
      icon: icons?.icon,
      iconActive: icons?.active,
      keywords: meta.keywords,
    }
  })
}

/** 顶部主导航项（meta.menu === true，按 order 排序） */
export function buildMenuEntries(): MenuEntry[] {
  return entries((r) => metaOf(r).menu === true, true)
}

/** 移动端 TabBar 项（meta.tab === true，按 order 排序） */
export function buildTabEntries(): MenuEntry[] {
  return entries((r) => metaOf(r).tab === true, true)
}

/**
 * 命令面板可跳转的页面
 *
 * 与主导航不同：包含隐藏页（meta.menu === false），因为"搜得到但不在导航里"
 * 正是命令面板的价值所在。
 */
export function buildCommandEntries(): MenuEntry[] {
  return entries((r) => metaOf(r).menu !== false && Boolean(metaOf(r).title), true)
}

/**
 * 导航项是否处于激活态
 *
 * 根路径必须精确匹配；其余按前缀 + 分隔符匹配，使详情页（/history/:id）
 * 能点亮父导航，同时避免 /files 误点亮 /filemanager/scan 这类同前缀路由。
 */
export function isNavActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === '/') return currentPath === '/'
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}
