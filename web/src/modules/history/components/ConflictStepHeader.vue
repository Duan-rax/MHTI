<script setup lang="ts">
/**
 * 冲突弹窗的步骤头（3 处复用）
 *
 * 左侧二选一：backLabel 渲染返回按钮，否则渲染 title 文本；
 * 右侧恒为 TMDB 搜索按钮。纯展示，动作经 emits 交给父组件。
 */
import { NButton, NIcon } from 'naive-ui'
import { ArrowBackOutline, SearchOutline } from '@vicons/ionicons5'

defineProps<{
  /** 返回按钮文案（传入时不渲染 title） */
  backLabel?: string
  /** 标题文案（backLabel 未传时使用） */
  title?: string
}>()

const emit = defineEmits<{
  back: []
  search: []
}>()
</script>

<template>
  <div class="step-header">
    <NButton v-if="backLabel" quaternary size="small" @click="emit('back')">
      <template #icon><NIcon :component="ArrowBackOutline" /></template>
      {{ backLabel }}
    </NButton>
    <span v-else class="section-title">{{ title }}</span>
    <NButton quaternary circle @click="emit('search')" aria-label="搜索剧集">
      <template #icon><NIcon :component="SearchOutline" /></template>
    </NButton>
  </div>
</template>

<style scoped>
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-2);
}
</style>