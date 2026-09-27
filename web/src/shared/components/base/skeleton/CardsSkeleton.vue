<script setup lang="ts">
/**
 * 页面骨架屏 - 卡片预设（带图标）
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
      <div class="surface stat-card">
        <Skeleton type="rect" width="40px" height="40px" />
        <div class="stat-card-info">
          <Skeleton width="72px" height="26px" />
          <Skeleton width="56px" height="13px" />
        </div>
      </div>
    </NGi>
  </NGrid>
</template>

<style scoped>
.stat-card {
  padding: var(--space-4);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.stat-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
