import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as logsApi from '@/shared/api/logs'
import type { LogQuery, LogStats, SystemLogEntry, SystemLogLevel } from '@/shared/types/common'

/**
 * 日志流 composable
 *
 * 从 LogViewer / LogSettings 提取的共同逻辑：
 * 日志列表加载（级别/关键词筛选 + 分页）/ 统计加载 / 刷新 /
 * 筛选变更处理 / 统计派生值 / 可选自动刷新。
 *
 * 各组件差异：
 * - 每页条数（getter 注入：查看器固定 100，配置页跟随分页器）
 * - 额外查询参数（extraQuery 注入：模块、时间范围等）
 * - 自动刷新间隔（不传则手动管理）
 * - 清空/清理/导出等操作（API 不同，留在组件内）
 */
export interface UseLogFeedOptions {
  /** 每页条数（getter，每次请求时读取；默认 20） */
  pageSize?: () => number
  /** 额外查询参数（每次请求时读取），如模块、时间范围 */
  extraQuery?: () => Partial<LogQuery>
  /** 自动刷新间隔（毫秒）；不传则不启用，自动挂载/卸载 */
  autoRefreshInterval?: number
}

/** 后端 detail 优先：拦截器只 reject 原始 axios error */
function describeError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } }; message?: string }
  return e?.response?.data?.detail || e?.message || fallback
}

export function useLogFeed(options: UseLogFeedOptions = {}) {
  const loading = ref(false)
  const logs = ref<SystemLogEntry[]>([])
  const total = ref(0)
  const page = ref(1)

  // 筛选状态
  const filterLevel = ref<SystemLogLevel | null>(null)
  const filterSearch = ref('')

  // 统计状态
  const statsLoading = ref(false)
  const stats = ref<LogStats | null>(null)

  /** 列表/统计的加载错误：原先只 console.error，调用方只能看到空表 */
  const error = ref('')

  // 加载日志列表
  const loadLogs = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await logsApi.getLogs({
        level: filterLevel.value || undefined,
        search: filterSearch.value || undefined,
        page: page.value,
        page_size: options.pageSize ? options.pageSize() : 20,
        ...options.extraQuery?.(),
      })
      logs.value = response.items
      total.value = response.total
    } catch (err) {
      error.value = describeError(err, '加载日志失败')
      console.error('加载日志失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    statsLoading.value = true
    try {
      stats.value = await logsApi.getLogStats()
    } catch (err) {
      error.value = error.value || describeError(err, '加载日志统计失败')
      console.error('加载统计失败:', err)
    } finally {
      statsLoading.value = false
    }
  }

  // 刷新（回到第一页并重载列表与统计）
  const refresh = () => {
    page.value = 1
    loadLogs()
    loadStats()
  }

  // 筛选变化（级别下拉传字符串值；其他筛选项传 undefined 仅触发重载）
  const handleFilterChange = (value?: unknown) => {
    if (typeof value === 'string') {
      filterLevel.value = value === 'all' ? null : (value as SystemLogLevel)
    }
    page.value = 1
    loadLogs()
  }

  // 统计派生值
  const errorCount = computed(() => stats.value?.by_level?.ERROR || 0)
  const warningCount = computed(() => stats.value?.by_level?.WARNING || 0)
  const infoCount = computed(() => stats.value?.by_level?.INFO || 0)

  // 自动刷新
  let refreshTimer: number | null = null

  const startAutoRefresh = () => {
    if (!options.autoRefreshInterval || refreshTimer) return
    refreshTimer = window.setInterval(() => {
      if (!loading.value) {
        loadLogs()
      }
    }, options.autoRefreshInterval)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  if (options.autoRefreshInterval) {
    onMounted(startAutoRefresh)
    onUnmounted(stopAutoRefresh)
  }

  return {
    error,
    loading,
    logs,
    total,
    page,
    filterLevel,
    filterSearch,
    statsLoading,
    stats,
    loadLogs,
    loadStats,
    refresh,
    handleFilterChange,
    errorCount,
    warningCount,
    infoCount,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
