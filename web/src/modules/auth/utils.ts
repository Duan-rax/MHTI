/**
 * auth 域工具函数
 *
 * 从 AdminConfigDrawer / SecurityPage 提取的逐字相同实现。
 */
import {
  DesktopOutline,
  PhonePortraitOutline,
  TabletPortraitOutline,
} from '@vicons/ionicons5'

/** 会话设备类型 → 图标 */
export function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case 'mobile':
      return PhonePortraitOutline
    case 'tablet':
      return TabletPortraitOutline
    default:
      return DesktopOutline
  }
}

/** 格式化日期（zh-CN，年月日时分） */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
