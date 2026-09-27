<script setup lang="ts">
/**
 * 文件表格（FilesPage 桌面视图）
 *
 * 列定义与行属性取自 useFileColumns（hook 内只描述"有哪些列、怎么渲染"）；
 * `:deep` 表格样式随本组件——父组件的 scoped 属性不作用于子组件内部。
 *
 * 视觉取舍：
 * - `:bordered="false"`：外框与圆角由页面的卡片承担。表格自带描边会与卡边
 *   并行成两条线，看起来像卡里又塞了一张卡。
 * - `size="small"`：文件浏览是"快速扫一眼找目标"的场景，行密一点更好读。
 * - 行悬停上抛 hover：由页面决定要不要预取（预取策略属于加载逻辑，不在表格里）。
 * - 时间/大小列固定宽度 + 等宽数字，纵向可比。
 */
import { NDataTable, type DataTableRowKey } from 'naive-ui'
import type { DirectoryEntry } from '@/shared/types/common'
import { useFileColumns } from '@/modules/library/hooks/useFileColumns'

defineProps<{
  entries: DirectoryEntry[]
  loading: boolean
  checkedRowKeys: DataTableRowKey[]
}>()

const emit = defineEmits<{
  'update:checkedRowKeys': [keys: DataTableRowKey[]]
  enter: [entry: DirectoryEntry]
  create: [entry: DirectoryEntry]
  hover: [entry: DirectoryEntry]
}>()

const { columns, rowProps } = useFileColumns({
  onEnterDirectory: (entry) => emit('enter', entry),
  onCreateTaskForFolder: (entry) => emit('create', entry),
  onRowHover: (entry) => emit('hover', entry),
})
</script>

<template>
  <div class="files-table">
    <NDataTable
      :columns="columns"
      :data="entries"
      :loading="loading"
      :row-key="(row: DirectoryEntry) => row.path"
      :checked-row-keys="checkedRowKeys"
      :row-props="rowProps"
      :bordered="false"
      size="small"
      :scroll-x="720"
      @update:checked-row-keys="emit('update:checkedRowKeys', $event)"
    />
  </div>
</template>

<style scoped>
/* -------------------- 名称列：图标 + 文本 -------------------- */
.files-table :deep(.file-name-cell) {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.files-table :deep(.folder-icon) {
  flex-shrink: 0;
  color: var(--warning-500);
}

.files-table :deep(.file-icon) {
  flex-shrink: 0;
  color: var(--text-3);
}

.files-table :deep(.file-name) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 目录名可点进入：悬停才给反馈，平时与文件名同样式，不预先染色 */
.files-table :deep(.file-name-cell.is-dir) {
  cursor: pointer;
}

.files-table :deep(.file-name-cell.is-dir:hover .file-name) {
  color: var(--brand-500);
}

/* -------------------- 元数据列：等宽数字，纵向对齐 -------------------- */
.files-table :deep(.col-time),
.files-table :deep(.col-size) {
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
