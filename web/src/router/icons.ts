/**
 * 菜单图标注册表
 *
 * 路由 meta.icon 只存键名，菜单/页头由此解析为组件，避免 meta 携带组件实例。
 */

import type { Component } from 'vue'
import {
  Home,
  HomeOutline,
  List,
  ListOutline,
  Folder,
  FolderOutline,
  Search,
  SearchOutline,
  Settings,
  SettingsOutline,
  ShieldCheckmark,
  ShieldCheckmarkOutline,
} from '@vicons/ionicons5'

export type IconKey = 'home' | 'scrape' | 'history' | 'library' | 'settings' | 'security'

export const ICONS: Record<IconKey, { icon: Component; active: Component }> = {
  home: { icon: HomeOutline, active: Home },
  scrape: { icon: SearchOutline, active: Search },
  history: { icon: ListOutline, active: List },
  library: { icon: FolderOutline, active: Folder },
  settings: { icon: SettingsOutline, active: Settings },
  security: { icon: ShieldCheckmarkOutline, active: ShieldCheckmark },
}