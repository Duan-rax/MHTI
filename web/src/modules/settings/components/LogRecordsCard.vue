<script setup lang="ts">
/**
 * 日志记录卡（框架：头部 → 指标条 → 筛选 → 表格 → 分页）
 *
 * 重构前是「操作按钮塞在卡片头右侧 + 筛选行 + 表格 + 分页」再加一张独立的统计卡，
 * 纵向三张卡把真正要看的日志推到第二屏。现在合成一张卡，从上到下就是一次阅读顺序：
 * 现在什么状态（指标）→ 想看哪一批（筛选）→ 内容（表格）。
 *
 * 1. 级别用 StatusBadge 而非彩色 NTag：一行一个胶囊色块会把 ERROR 淹没；
 * 2. 导出收敛成一个下拉（原先与刷新/清理共挤 4 个按钮）；下拉显式声明 trigger="click"
 *    ——naive 的 NDropdown 默认 hover，触屏上根本点不开；
 * 3. 空态区分「筛不出来」与「本来就没有」：前者给「清除筛选」，后者给来源说明；
 * 4. 日志配置不占列表位置，改为头部「配置」按钮打开的弹窗（见 LogConfigModal）。
 *
 * 事件契约：`update:filterLevel` / `update:filterLogger` 立即生效（父组件收到就重查），
 * `filterChange` 只给按回车 / 点「搜索」这类延迟提交用；两者不可同时触发，否则打两次接口。
 */
import { computed, h } from 'vue'
import {
  NButton,
  NDataTable,
  NDropdown,
  NPagination,
  NPopconfirm,
  type DataTableColumns,
  type DropdownOption,
  type SelectOption,
} from 'naive-ui'
import type { SystemLogEntry, SystemLogLevel, LogStats } from '@/shared/types/common'
import { formatDateTime } from '@/shared/utils/format'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import StatusBadge from '@/shared/components/business/StatusBadge.vue'
import LogMetricsStrip from '@/modules/settings/components/LogMetricsStrip.vue'
import LogFilterBar from '@/modules/settings/components/LogFilterBar.vue'

const props = defineProps<{
  logs: SystemLogEntry[]
  loading: boolean
  total: number
  page: number
  pageSize: number
  stats: LogStats | null
  statsLoading: boolean
  errorCount: number
  warningCount: number
  infoCount: number
  levelOptions: SelectOption[]
  loggerOptions: SelectOption[]
  filterLevel: SystemLogLevel | null
  filterLogger: string | null
  filterSearch: string
  filterDateRange: [number, number] | null
  retentionDays: number
  /** 定时拉取的开关状态（不代表后端实时推送开关） */
  autoRefresh: boolean
  clearing: boolean
  exporting: boolean
  loadError?: string
  actionError?: string
}>()

const emit = defineEmits<{
  'update:filterLevel': [value: SystemLogLevel | null]
  'update:filterLogger': [value: string | null]
  'update:filterSearch': [value: string]
  'update:filterDateRange': [value: [number, number] | null]
  'update:page': [value: number]
  'update:pageSize': [value: number]
  filterChange: []
  clearFilters: []
  toggleAutoRefresh: []
  refresh: []
  cleanup: []
  export: [format: 'json' | 'csv']
  openConfig: []
  retry: []
}>()

const hasFilters = computed(() =>
  Boolean(props.filterLevel || props.filterLogger || props.filterSearch || props.filterDateRange),
)

const exportOptions: DropdownOption[] = [
  { label: '导出 JSON', key: 'json' },
  { label: '导出 CSV', key: 'csv' },
]

/** 级别 → 徽章色调：DEBUG 中性、INFO 信息、WARNING 警告、ERROR/CRITICAL 错误 */
const levelTone = (level: string): 'default' | 'info' | 'warning' | 'error' => {
  const map: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
    DEBUG: 'default',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'error',
  }
  return map[level] || 'default'
}

const columns: DataTableColumns<SystemLogEntry> = [
  {
    title: '时间',
    key: 'timestamp',
    width: 168,
    className: 'col-time',
    render: (row) => formatDateTime(row.timestamp),
  },
  {
    title: '级别',
    key: 'level',
    width: 96,
    render: (row) => h(StatusBadge, { status: levelTone(row.level), text: row.level }),
  },
  {
    title: '模块',
    key: 'logger',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '消息',
    key: 'message',
    ellipsis: { tooltip: true },
  },
]
</script>

<template>
  <SettingsSection
    title="日志记录"
    :error="loadError"
    :action-error="actionError"
    @retry="emit('retry')"
  >
    <template #header-extra>
      <NButton
        size="small"
        quaternary
        :aria-pressed="autoRefresh"
        @click="emit('toggleAutoRefresh')"
      >
        <span class="live-dot" :class="{ 'is-on': autoRefresh }" aria-hidden="true" />
        {{ autoRefresh ? '自动刷新' : '已暂停' }}
      </NButton>
      <NButton size="small" @click="emit('refresh')">刷新</NButton>
      <NDropdown
        trigger="click"
        :options="exportOptions"
        @select="emit('export', $event as 'json' | 'csv')"
      >
        <NButton size="small" :loading="exporting">导出</NButton>
      </NDropdown>
      <NButton size="small" @click="emit('openConfig')">配置</NButton>
      <NPopconfirm @positive-click="emit('cleanup')">
        <template #trigger>
          <NButton size="small" :loading="clearing">清理过期</NButton>
        </template>
        确定清理超过 {{ retentionDays }} 天的日志？
      </NPopconfirm>
    </template>

    <LogMetricsStrip
      :stats="stats"
      :loading="statsLoading"
      :error-count="errorCount"
      :warning-count="warningCount"
      :info-count="infoCount"
      :active-level="filterLevel"
      @select="emit('update:filterLevel', $event as SystemLogLevel | null)"
    />

    <LogFilterBar
      :level-options="levelOptions"
      :logger-options="loggerOptions"
      :level="filterLevel"
      :logger="filterLogger"
      :search="filterSearch"
      :date-range="filterDateRange"
      @update:level="emit('update:filterLevel', $event)"
      @update:logger="emit('update:filterLogger', $event)"
      @update:search="emit('update:filterSearch', $event)"
      @update:date-range="emit('update:filterDateRange', $event)"
      @change="emit('filterChange')"
      @clear="emit('clearFilters')"
    />

    <div class="table-block">
      <NDataTable
        :columns="columns"
        :data="logs"
        :loading="loading"
        :row-key="(row: SystemLogEntry) => row.id"
        size="small"
        :max-height="480"
        :scroll-x="880"
      >
        <template #empty>
          <div class="empty">
            <p class="empty-title">
              {{ hasFilters ? '没有符合条件的日志' : '暂无日志记录' }}
            </p>
            <p class="empty-hint">
              {{
                hasFilters
                  ? '放宽级别、模块或时间范围再试'
                  : '应用运行中的警告与错误会记录在这里'
              }}
            </p>
            <NButton v-if="hasFilters" size="small" @click="emit('clearFilters')">
              清除筛选
            </NButton>
          </div>
        </template>
      </NDataTable>
    </div>

    <div class="pager">
      <span class="pager-total">共 {{ total.toLocaleString('zh-CN') }} 条</span>
      <NPagination
        :page="page"
        :page-size="pageSize"
        :item-count="total"
        :page-sizes="[10, 20, 50, 100]"
        show-size-picker
        @update:page="emit('update:page', $event)"
        @update:page-size="emit('update:pageSize', $event)"
      />
    </div>
  </SettingsSection>
</template>

<style scoped>
/* 自动刷新状态点：开启时语义绿，暂停时中性灰 */
.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 5px;
  border-radius: var(--radius-full);
  background: var(--text-3);
}

.live-dot.is-on {
  background: var(--success-500);
}

/* 时间列等宽对齐：日志按时间读，比例字体会让每行时间戳左右错位 */
.table-block :deep(.col-time) {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* -------------------- 空态 -------------------- */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-8) var(--space-4);
}

.empty-title {
  margin: 0;
  font-size: var(--text-base);
  color: var(--text-1);
}

.empty-hint {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-2);
}

/* -------------------- 分页 -------------------- */
.pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.pager-total {
  font-size: var(--text-xs);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

/* 窄屏把条数让给分页器（总条数在指标条里已有） */
@media (max-width: 767px) {
  .pager { justify-content: flex-end; }
  .pager-total { display: none; }
}
</style>
