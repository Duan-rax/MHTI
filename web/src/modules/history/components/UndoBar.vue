<script setup lang="ts">
/**
 * 撤销提示条（删除记录 / 清空记录之后出现）
 *
 * 为什么不做成 toast：toast 几秒后自动消失，而删除是即时生效、不进回收站的，
 * 用户唯一的后悔药就是这条提示——它必须稳定地待在那里直到用户做出选择。
 * 因此做成页面顶部常驻的一条，只在物理删除（不可撤销）时不给撤销按钮。
 */
import { NButton, NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

defineProps<{
  message: string
  loading?: boolean
}>()

const emit = defineEmits<{
  undo: []
  close: []
}>()
</script>

<template>
  <div class="undo-bar" role="status">
    <span class="undo-text">{{ message }}</span>
    <div class="undo-actions">
      <NButton size="small" :loading="loading" @click="emit('undo')">撤销</NButton>
      <button type="button" class="icon-btn" aria-label="关闭撤销提示" @click="emit('close')">
        <NIcon :component="CloseOutline" :size="15" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.undo-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
}

.undo-text {
  font-size: var(--text-sm);
  color: var(--text-1);
}

.undo-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}
</style>
