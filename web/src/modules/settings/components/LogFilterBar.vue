<script setup lang="ts">
/**
 * LogFilterBar — 日志筛选行
 *
 * 从记录卡里剥出，记录卡只留「头部 + 指标条 + 表格 + 分页」骨架。
 *
 * 提交时机保持重构前行为：级别与模块是离散选择，改完立即查询（父组件在对应
 * update 事件里重查）；关键词与时间范围是连续输入，回车或点「搜索」才发 `change`
 * （每敲一个字符打一次接口既浪费也会打断输入）。「清除筛选」只在有筛选时出现——
 * 没有筛选就不该出现一个点不出效果按钮。
 */
import { computed } from 'vue'
import { NButton, NDatePicker, NInput, NSelect, type SelectOption } from 'naive-ui'
import type { SystemLogLevel } from '@/shared/types/common'

const props = defineProps<{
  levelOptions: SelectOption[]
  loggerOptions: SelectOption[]
  level: SystemLogLevel | null
  logger: string | null
  search: string
  dateRange: [number, number] | null
}>()

const emit = defineEmits<{
  'update:level': [value: SystemLogLevel | null]
  'update:logger': [value: string | null]
  'update:search': [value: string]
  'update:dateRange': [value: [number, number] | null]
  change: []
  clear: []
}>()

const hasFilters = computed(() =>
  Boolean(props.level || props.logger || props.search || props.dateRange),
)

/** 'all' 是"不限"哨兵值（见 constants.LOG_LEVEL_OPTIONS），出组件时映射回 null */
function onLevel(value: string) {
  emit('update:level', value === 'all' ? null : (value as SystemLogLevel))
}

function onLogger(value: string) {
  emit('update:logger', value === 'all' ? null : value)
}
</script>

<template>
  <div class="filters">
    <NSelect
      class="filter-level"
      size="small"
      :value="level ?? 'all'"
      :options="levelOptions"
      aria-label="按日志级别筛选"
      @update:value="onLevel"
    />
    <NSelect
      class="filter-logger"
      size="small"
      :value="logger ?? 'all'"
      :options="loggerOptions"
      filterable
      aria-label="按模块筛选"
      @update:value="onLogger"
    />
    <NInput
      class="filter-search"
      size="small"
      :value="search"
      placeholder="搜索日志内容"
      clearable
      :input-props="{ 'aria-label': '搜索日志内容' }"
      @update:value="emit('update:search', $event)"
      @keyup.enter="emit('change')"
      @clear="emit('change')"
    />
    <NDatePicker
      class="filter-date"
      size="small"
      :value="dateRange"
      type="datetimerange"
      clearable
      aria-label="按时间范围筛选"
      @update:value="emit('update:dateRange', $event)"
    />
    <NButton size="small" @click="emit('change')">搜索</NButton>
    <NButton v-if="hasFilters" size="small" quaternary @click="emit('clear')">清除筛选</NButton>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.filter-level {
  width: 124px;
}

.filter-logger {
  width: 176px;
}

.filter-search {
  flex: 1;
  min-width: 180px;
}

.filter-date {
  width: 320px;
}

/* 窄屏：搜索框整行独占，时间范围拉满，其余控件保持原宽 */
@media (max-width: 767px) {
  .filter-search,
  .filter-date {
    flex: 1 1 100%;
    width: 100%;
  }
}
</style>
