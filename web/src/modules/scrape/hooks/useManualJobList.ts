import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type DataTableRowKey } from 'naive-ui'
import { manualJobApi } from '@/modules/scrape/api'
import type { ManualJob, ManualJobStatus } from '@/modules/scrape/types'

/**
 * 手动任务列表（ScanPage）
 *
 * 列表加载/搜索/筛选/分页/批量删除 + 3 秒轮询（仅当有运行中任务时）。
 */
export function useManualJobList() {
  const router = useRouter()
  const message = useMessage()

  const loading = ref(false)
  const jobs = ref<ManualJob[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const search = ref('')
  const statusFilter = ref<ManualJobStatus | null>(null)
  const checkedRowKeys = ref<DataTableRowKey[]>([])
  const showCreateModal = ref(false)

  let refreshTimer: ReturnType<typeof setInterval> | null = null

  // 加载数据
  const loadJobs = async () => {
    loading.value = true
    try {
      const response = await manualJobApi.list({
        page: page.value,
        page_size: pageSize.value,
        search: search.value || undefined,
        status: statusFilter.value,
      })
      jobs.value = response.jobs
      total.value = response.total
    } catch (error) {
      message.error('加载失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    page.value = 1
    loadJobs()
  }

  // 状态筛选
  const handleStatusChange = (value: string) => {
    statusFilter.value = value === 'all' ? null : (value as ManualJobStatus)
    page.value = 1
    loadJobs()
  }

  // 分页
  const handlePageChange = (p: number) => {
    page.value = p
    loadJobs()
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (checkedRowKeys.value.length === 0) return

    try {
      await manualJobApi.delete(checkedRowKeys.value as number[])
      message.success('删除成功')
      checkedRowKeys.value = []
      loadJobs()
    } catch (error) {
      message.error('删除失败')
      console.error(error)
    }
  }

  // 创建任务成功
  const handleCreateSuccess = () => {
    showCreateModal.value = false
    loadJobs()
    message.success('任务已创建')
  }

  // 选中行变化
  const handleCheckedRowKeysChange = (keys: DataTableRowKey[]) => {
    checkedRowKeys.value = keys
  }

  // 跳转到历史记录
  const goToHistory = (job: ManualJob) => {
    router.push({ path: '/history', query: { manual_job_id: job.id } })
  }

  // 是否有运行中的任务
  const hasRunningJobs = computed(() => jobs.value.some((j) => j.status === 'running' || j.status === 'pending'))

  onMounted(() => {
    loadJobs()
    // 定时刷新（有运行中任务时）
    refreshTimer = setInterval(() => {
      if (hasRunningJobs.value) {
        loadJobs()
      }
    }, 3000)
  })

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
  })

  return {
    loading,
    jobs,
    total,
    page,
    pageSize,
    search,
    statusFilter,
    checkedRowKeys,
    showCreateModal,
    loadJobs,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    handleBatchDelete,
    handleCreateSuccess,
    handleCheckedRowKeysChange,
    goToHistory,
    hasRunningJobs,
  }
}