<script setup lang="ts">
/**
 * 页面骨架屏 - 网格预设
 *
 * responsiveCols 由父组件按 cols 计算后传入（Naive UI 的响应式列格式）。
 */
import { NGi, NGrid } from 'naive-ui'
import Skeleton from '@/shared/components/base/Skeleton.vue'

defineProps<{
  count: number
  responsiveCols: string
}>()
</script>

<template>
  <NGrid :x-gap="16" :y-gap="16" :cols="responsiveCols" responsive="screen">
    <NGi v-for="i in count" :key="i">
      <div class="surface grid-card">
        <Skeleton type="rect" height="96px" />
        <div class="grid-card-content">
          <Skeleton width="80%" height="15px" />
          <Skeleton width="60%" height="13px" />
        </div>
      </div>
    </NGi>
  </NGrid>
</template>

<style scoped>
.grid-card {
  padding: var(--space-4);
}

.grid-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
</style>
