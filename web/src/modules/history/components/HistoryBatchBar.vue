<script setup lang="ts">
/**
 * 批量操作条（列表页勾选记录后出现）
 *
 * 只在有选中时渲染，位置贴着工具栏：勾选动作的反馈必须紧跟勾选处，
 * 不能要求用户滚到列表底部去找按钮。
 */
import { NButton, NProgress } from 'naive-ui'

defineProps<{
  count: number
  running: boolean
  progressText: string
  /** 进度百分比（0-100） */
  percent: number
  /** 状态可重试但缺匹配信息的条数（勾选框禁用，需说明原因） */
  manualCount: number
}>()

defineEmits<{
  retry: []
  stop: []
  clear: []
}>()
</script>

<template>
  <div class="batch-bar" role="group" aria-label="批量操作">
    <span class="batch-count">已选 {{ count }} 条</span>

    <span v-if="manualCount > 0 && !running" class="batch-note">
      {{ manualCount }} 条缺少匹配信息，需逐条处理
    </span>
    <span v-if="running" class="batch-progress">{{ progressText }}</span>
    <NProgress
      v-if="running"
      class="batch-progress-bar"
      type="line"
      :percentage="percent"
      :height="4"
      :show-indicator="false"
      :border-radius="2"
    />

    <div class="batch-actions">
      <NButton size="small" quaternary :disabled="running" @click="$emit('clear')">取消选择</NButton>
      <NButton v-if="running" size="small" @click="$emit('stop')">停止</NButton>
      <NButton v-else size="small" type="primary" @click="$emit('retry')">批量重试</NButton>
    </div>
  </div>
</template>

<style scoped>
.batch-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
}

.batch-count {
  font-size: var(--text-sm);
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

.batch-note {
  font-size: var(--text-xs);
  color: var(--warning-500);
}

.batch-progress {
  font-size: var(--text-xs);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.batch-progress-bar {
  flex: 1;
  min-width: 120px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
</style>
