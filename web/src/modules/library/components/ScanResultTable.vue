<script setup lang="ts">
/**
 * 扫描结果表格（FileScanPage 桌面表格）
 *
 * 列定义随组件（render 依赖展示函数）；格式化函数已收敛至
 * library/utils.ts（与 FilesPage 原实现输出逐字相同）。
 */
import { h } from 'vue'
import { NButton, NDataTable, NIcon, type DataTableColumns, type DataTableRowKey } from 'naive-ui'
import { AddOutline, DocumentOutline } from '@vicons/ionicons5'
import type { ScannedFile } from '@/modules/library/types'
import { formatSize, formatTime } from '@/modules/library/utils'

defineProps<{
  files: ScannedFile[]
  loading: boolean
  checkedRowKeys: DataTableRowKey[]
}>()

const emit = defineEmits<{
  'update:checkedRowKeys': [keys: DataTableRowKey[]]
  create: [file: ScannedFile]
}>()

// 表格列
const columns: DataTableColumns<ScannedFile> = [
  { type: 'selection' },
  {
    title: '名称',
    key: 'filename',
    ellipsis: { tooltip: true },
    render: (row) =>
      h('div', { class: 'file-name-cell' }, [
        h(NIcon, {
          component: DocumentOutline,
          size: 20,
          class: 'file-icon',
        }),
        h('span', { class: 'file-name' }, row.filename),
      ]),
  },
  {
    title: '修改时间',
    key: 'mtime',
    width: 180,
    render: (row) => formatTime(row.mtime),
  },
  {
    title: '文件大小',
    key: 'size',
    width: 120,
    align: 'right',
    render: (row) => formatSize(row.size),
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          onClick: () => emit('create', row),
        },
        { icon: () => h(NIcon, { component: AddOutline }) }
      ),
  },
]
</script>

<template>
  <NDataTable
    :columns="columns"
    :data="files"
    :loading="loading"
    :row-key="(row: ScannedFile) => row.path"
    :checked-row-keys="checkedRowKeys"
    @update:checked-row-keys="emit('update:checkedRowKeys', $event as DataTableRowKey[])"
  />
</template>

<style scoped>
/* 文件名单元格 */
:deep(.file-name-cell) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.file-icon) {
  color: var(--text-3);
  flex-shrink: 0;
}

:deep(.file-name) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>