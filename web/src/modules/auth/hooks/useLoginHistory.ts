import { ref, h } from 'vue'
import { NIcon, useMessage, type DataTableColumns } from 'naive-ui'
import { CheckmarkCircle, CloseCircle } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import type { LoginHistoryItem } from '@/modules/auth/api'
import { formatDate } from '@/modules/auth/utils'

/**
 * 登录历史分页查询（AdminConfigDrawer / SecurityPage 共用）
 *
 * 两处的列定义不同（抽屉 4 列 / 安全页 5 列含失败原因），
 * 故导出两份列常量，由使用方选择；分页状态与加载逻辑共用。
 */
export function useLoginHistory(variant: 'drawer' | 'page') {
  const authStore = useAuthStore()
  const message = useMessage()

  const historyItems = ref<LoginHistoryItem[]>([])
  const loadingHistory = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    itemCount: 0,
  })

  // 加载登录历史
  const loadHistory = async (page = 1) => {
    loadingHistory.value = true
    try {
      const offset = (page - 1) * pagination.value.pageSize
      const result = await authStore.getLoginHistory(pagination.value.pageSize, offset)
      historyItems.value = result.items
      pagination.value.itemCount = result.total
      pagination.value.page = page
    } catch {
      message.error('加载登录历史失败')
    } finally {
      loadingHistory.value = false
    }
  }

  const columns = variant === 'drawer' ? drawerHistoryColumns : pageHistoryColumns

  return {
    historyItems,
    loadingHistory,
    pagination,
    loadHistory,
    columns,
  }
}

/** 状态列渲染（两处逐字相同） */
function renderStatus(row: LoginHistoryItem, size: number) {
  return h(NIcon, {
    size,
    color: row.success ? 'var(--success-500)' : 'var(--danger-500)',
    component: row.success ? CheckmarkCircle : CloseCircle,
  })
}

/** 抽屉内列（4 列：状态/设备/IP/时间） */
export const drawerHistoryColumns: DataTableColumns<LoginHistoryItem> = [
  {
    title: '状态',
    key: 'success',
    width: 60,
    render(row) {
      return renderStatus(row, 18)
    },
  },
  {
    title: '设备',
    key: 'device_name',
    ellipsis: { tooltip: true },
    render(row) {
      return row.device_name || '未知设备'
    },
  },
  {
    title: 'IP',
    key: 'ip_address',
    width: 120,
  },
  {
    title: '时间',
    key: 'login_time',
    width: 150,
    render(row) {
      return formatDate(row.login_time)
    },
  },
]

/** 安全页列（5 列：状态/设备/IP 地址/登录时间/失败原因） */
export const pageHistoryColumns: DataTableColumns<LoginHistoryItem> = [
  {
    title: '状态',
    key: 'success',
    width: 80,
    render(row) {
      return renderStatus(row, 20)
    },
  },
  {
    title: '设备',
    key: 'device_name',
    ellipsis: { tooltip: true },
    render(row) {
      return row.device_name || '未知设备'
    },
  },
  {
    title: 'IP 地址',
    key: 'ip_address',
    width: 140,
  },
  {
    title: '登录时间',
    key: 'login_time',
    width: 170,
    render(row) {
      return formatDate(row.login_time)
    },
  },
  {
    title: '失败原因',
    key: 'failure_reason',
    ellipsis: { tooltip: true },
    render(row) {
      return row.failure_reason || '-'
    },
  },
]
