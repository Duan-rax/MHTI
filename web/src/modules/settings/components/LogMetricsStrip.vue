<script setup lang="ts">
/**
 * 日志指标条（4 个数字 + 可点筛选）
 *
 * 原 LogStatsCards：一张独立卡片里放 4 个数字，占了半屏高度却只回答"有多少"。
 * 现在压成卡片内的一行指标条，并且每一项都是**筛选入口**——从"看到 3 个错误"
 * 到"看这 3 个错误"只需一次点击（重构前要用级别下拉框再点搜索，三步）。
 *
 * 版式：小标签在上、大数字在下，数字等宽；命中项用底部指示条 + 主色文字，
 * 颜色仍只用语义色文字，不做彩色底块（一行四个色块会把 ERROR 淹没）。
 */
import { computed } from 'vue'
import type { LogStats, SystemLogLevel } from '@/shared/types/common'

const props = defineProps<{
  stats: LogStats | null
  loading: boolean
  errorCount: number
  warningCount: number
  infoCount: number
  /** 当前生效的级别筛选（null = 不限），用于点亮对应指标 */
  activeLevel: SystemLogLevel | null
}>()

const emit = defineEmits<{ select: [level: SystemLogLevel | null] }>()

interface Metric {
  /** null = 清除级别筛选 */
  level: SystemLogLevel | null
  label: string
  value: number
  /** 数值语义色：仅"错误"在有值时着色 */
  tone?: 'danger'
  /** 无数据时不着色也不可点（例如错误数为 0） */
  clickable: boolean
}

const metrics = computed<Metric[]>(() => [
  { level: null, label: '总日志数', value: props.stats?.total ?? 0, clickable: props.activeLevel !== null },
  { level: 'ERROR', label: '错误日志', value: props.errorCount, tone: 'danger', clickable: true },
  { level: 'WARNING', label: '警告日志', value: props.warningCount, clickable: true },
  { level: 'INFO', label: '信息日志', value: props.infoCount, clickable: true },
])

function isActive(metric: Metric): boolean {
  return metric.level === props.activeLevel
}

function onSelect(metric: Metric) {
  if (!metric.clickable) return
  emit('select', metric.level)
}

/** 千分位：日志量上万后 12000 比 12,000 难读 */
function format(count: number): string {
  return count.toLocaleString('zh-CN')
}
</script>

<template>
  <div class="metrics" :aria-busy="loading" role="group" aria-label="日志统计与快速筛选">
    <button
      v-for="metric in metrics"
      :key="metric.label"
      type="button"
      class="metric"
      :class="{
        'is-active': isActive(metric),
        'is-clickable': metric.clickable,
        'is-danger': metric.tone === 'danger' && metric.value > 0,
      }"
      :disabled="!metric.clickable"
      :aria-pressed="metric.clickable ? isActive(metric) : undefined"
      @click="onSelect(metric)"
    >
      <span class="metric-label">{{ metric.label }}</span>
      <span class="metric-value">{{ loading ? '—' : format(metric.value) }}</span>
    </button>
  </div>
</template>

<style scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-1);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-1);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

/* 不可点（已在不限级别、或该指标没有可选目标）时不加 hover 反馈 */
.metric:not(.is-clickable) {
  cursor: default;
}

.metric.is-clickable:hover {
  background: var(--bg-hover);
}

.metric:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.metric-label {
  font-size: var(--text-xs);
  color: var(--text-2);
}

.metric-value {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

.metric.is-danger .metric-value {
  color: var(--danger-500);
}

/* 命中态：文字转主色 + 数字左侧 2px 指示条（同设置页导航的激活语言） */
.metric.is-active {
  background: var(--brand-50);
}

.metric.is-active .metric-label,
.metric.is-active .metric-value {
  color: var(--brand-600);
}

.metric.is-active .metric-value {
  padding-left: var(--space-2);
  border-left: 2px solid var(--brand-500);
}

@media (max-width: 767px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
