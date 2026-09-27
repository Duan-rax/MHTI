import { h } from 'vue'
import { NButton, NIcon, type DataTableColumns } from 'naive-ui'
import { AddOutline, DocumentOutline, FolderOutline } from '@vicons/ionicons5'
import type { DirectoryEntry } from '@/shared/types/common'
import { formatSize, formatTime } from '@/modules/library/utils'

/**
 * 文件树表格列与行属性（FilesPage）
 *
 * 列顺序、宽度、对齐与 render 结构逐字保留；格式函数取 library/utils。
 * 高亮/进入动作经回调注入，避免 hook 反向依赖页面状态。
 *
 * 类名与 hook 放在一起：naive 用 render 产出单元格内容，样式只能写在渲染它的
 * 组件里（见 FilesTable.vue 的 :deep）；这里只负责把状态翻译成类名。
 *   .file-name-cell.is-dir —— 目录名可点进入（悬停给反馈，文件不给）
 *   .col-time / .col-size —— 等宽数字，纵向可比
 */
export function useFileColumns(options: {
  /** 点击目录名（单击，仅目录） */
  onEnterDirectory: (entry: DirectoryEntry) => void
  /** 为目录建任务 */
  onCreateTaskForFolder: (entry: DirectoryEntry) => void
  /** 悬停目录行：桌面端用于预取该目录内容（真进去时命中缓存） */
  onRowHover?: (entry: DirectoryEntry) => void
}) {
  const columns: DataTableColumns<DirectoryEntry> = [
    { type: 'selection' },
    {
      title: '名称',
      key: 'name',
      ellipsis: { tooltip: true },
      render: (row) =>
        h(
          'div',
          {
            class: ['file-name-cell', row.is_dir ? 'is-dir' : ''],
            onClick: () => row.is_dir && options.onEnterDirectory(row),
          },
          [
            h(NIcon, {
              component: row.is_dir ? FolderOutline : DocumentOutline,
              size: 18,
              class: row.is_dir ? 'folder-icon' : 'file-icon',
            }),
            h('span', { class: 'file-name' }, row.name),
          ],
        ),
    },
    {
      title: '修改时间',
      key: 'mtime',
      width: 180,
      className: 'col-time',
      render: (row) => formatTime(row.mtime),
    },
    {
      title: '文件大小',
      key: 'size',
      width: 120,
      align: 'right',
      className: 'col-size',
      render: (row) => formatSize(row.size),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (row) =>
        row.is_dir
          ? h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                // render 函数产出的图标按钮同样需要可访问名称
                'aria-label': '用此目录创建任务',
                onClick: () => options.onCreateTaskForFolder(row),
              },
              { icon: () => h(NIcon, { component: AddOutline }) }
            )
          : null,
    },
  ]

  const rowProps = (row: DirectoryEntry) => ({
    style: row.is_dir ? 'cursor: pointer;' : '',
    onDblclick: () => row.is_dir && options.onEnterDirectory(row),
    onMouseenter: () => row.is_dir && options.onRowHover?.(row),
  })

  return { columns, rowProps }
}
