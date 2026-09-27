<script setup lang="ts">
/**
 * 手动任务桌面表格（ScanPage 桌面视图）
 *
 * 列定义随组件（render 依赖 ProgressCell 与展示函数）；:deep 表格样式
 * 随迁（父 scoped 属性不作用于子组件内部）。
 * 展示函数与 ScanPage 原实现逐字一致（formatTime 字符串切片、
 * formatDuration 秒数计算、getProgressPercent 千分比）。
 */
import { h } from 'vue'
import { NButton, NDataTable, NIcon, type DataTableColumns, type DataTableRowKey } from 'naive-ui'
import { ListOutline } from '@vicons/ionicons5'
import type { ManualJob } from '@/modules/scrape/types'
import { LinkMode } from '@/modules/scrape/types'
import ProgressCell from '@/modules/scrape/components/ProgressCell.vue'
import { JOB_STATUS_BADGE, LINK_MODE_LABELS } from '@/modules/scrape/constants'
import StatusBadge from '@/shared/components/business/StatusBadge.vue'

defineProps<{
  jobs: ManualJob[]
  loading: boolean
  checkedRowKeys: DataTableRowKey[]
}>()

const emit = defineEmits<{
  'update:checkedRowKeys': [keys: DataTableRowKey[]]
  record: [job: ManualJob]
}>()

// 格式化时间
const formatTime = (time: string | null) => {
  if (!time) return '-'
  return time.replace('T', ' ').slice(0, 19)
}

// 计算用时
const formatDuration = (job: ManualJob) => {
  if (!job.started_at) return '-'
  const start = new Date(job.started_at).getTime()
  const end = job.finished_at ? new Date(job.finished_at).getTime() : Date.now()
  const seconds = (end - start) / 1000
  return `${seconds.toFixed(2)}s`
}

const columns: DataTableColumns<ManualJob> = [
  { type: 'selection' },
  { title: '#', key: 'id', width: 60 },
  {
    title: '扫描目录',
    key: 'scan_path',
    ellipsis: { tooltip: true },
    width: 180,
  },
  {
    title: '整理目录',
    key: 'target_folder',
    ellipsis: { tooltip: true },
    width: 180,
  },
  {
    title: '整理模式',
    key: 'link_mode',
    width: 90,
    // 整理模式只是配置结果，不承载状态语义，用中性小字而非彩色标签
    render: (row) =>
      h('span', { class: 'cell-muted' }, LINK_MODE_LABELS[row.link_mode as LinkMode] || '未知'),
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 160,
    render: (row) => formatTime(row.created_at),
  },
  {
    title: '用时',
    key: 'duration',
    width: 80,
    render: (row) => formatDuration(row),
  },
  {
    title: '进度',
    key: 'progress',
    width: 180,
    render: (row) =>
      h(ProgressCell, {
        successCount: row.success_count,
        skipCount: row.skip_count,
        errorCount: row.error_count,
        totalCount: row.total_count,
      }),
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      const badge = JOB_STATUS_BADGE[row.status] ?? { status: 'default' as const, text: row.status }
      return h(StatusBadge, { status: badge.status, text: badge.text, size: 'small' })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          onClick: () => emit('record', row),
        },
        {
          icon: () => h(NIcon, { component: ListOutline }),
          default: () => '记录',
        }
      ),
  },
]
</script>

<template>
  <div class="job-table">
    <NDataTable
      :columns="columns"
      :data="jobs"
      :loading="loading"
      :row-key="(row: ManualJob) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="emit('update:checkedRowKeys', $event as DataTableRowKey[])"
    />
  </div>
</template>

<style scoped>
.job-table :deep(.n-data-table) {
  border-radius: 8px;
}

.job-table :deep(.n-data-table-th) {
  font-weight: 600;
}

.job-table :deep(.n-data-table-tr:hover) {
  background: var(--bg-hover);
}
</style>