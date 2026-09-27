<script setup lang="ts">
/**
 * 刮削记录工具栏（HistoryPage 的 filters 槽）
 *
 * 返回/搜索/状态筛选 + 刷新/导出/清空。状态筛选选项表随组件
 * （仅此处消费）。纯展示：search 经 v-model 透传，动作经事件上抛。
 */
import { NButton, NIcon, NInput, NPopconfirm, NSelect } from 'naive-ui'
import {
  ArrowBackOutline,
  DownloadOutline,
  RefreshOutline,
  SearchOutline,
  TrashOutline,
} from '@vicons/ionicons5'
import type { TaskStatus } from '@/modules/history/types'

defineProps<{
  modelValue: string
  statusFilter: TaskStatus | null
  /** 从手动任务进入时显示返回按钮 */
  manualJobId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  /** 原实现 handleStatusChange(value: string) 的入参类型，原样保留 */
  statusChange: [value: string]
  back: []
  refresh: []
  export: []
  clear: []
}>()

// 状态筛选选项
const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '处理中', value: 'running' },
  { label: '待处理', value: 'pending_action' },
  { label: '超时', value: 'timeout' },
  { label: '跳过', value: 'skipped' },
  { label: '取消', value: 'cancelled' },
]
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <NButton v-if="manualJobId" quaternary @click="emit('back')">
        <template #icon><NIcon :component="ArrowBackOutline" /></template>
        返回
      </NButton>
      <NInput
        :value="modelValue"
        placeholder="搜索名称、文件夹..."
        clearable
        class="search-input"
        @update:value="emit('update:modelValue', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <NIcon :component="SearchOutline" />
        </template>
      </NInput>
      <NSelect
        :value="statusFilter ?? 'all'"
        :options="statusOptions"
        class="status-select"
        @update:value="emit('statusChange', $event)"
      />
    </div>
    <div class="toolbar-right">
      <NButton quaternary aria-label="刷新" @click="emit('refresh')">
        <template #icon><NIcon :component="RefreshOutline" /></template>
      </NButton>
      <NButton @click="emit('export')">
        <template #icon><NIcon :component="DownloadOutline" /></template>
        导出
      </NButton>
      <NPopconfirm @positive-click="emit('clear')">
        <template #trigger>
          <NButton type="error" quaternary aria-label="清空全部历史记录">
            <template #icon><NIcon :component="TrashOutline" /></template>
          </NButton>
        </template>
        确定要清空所有历史记录吗？
      </NPopconfirm>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.search-input {
  width: 260px;
}

.status-select {
  width: 128px;
}

/* 危险操作与常规操作之间加分隔线：清空是不可逆动作，不该和刷新手感一样 */
.toolbar-right :deep(.n-popover) {
  margin-left: var(--space-1);
}

@media (max-width: 767px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .search-input {
    flex: 1;
    width: auto;
  }

  .toolbar-right {
    justify-content: flex-end;
  }
}
</style>