<script setup lang="ts">
/**
 * 页面骨架屏 - 详情页预设
 *
 * 首图宽度按 isMobile 切换（100% / 200px），由父组件传入。
 */
import { NGi, NGrid } from 'naive-ui'
import Skeleton from '@/shared/components/base/Skeleton.vue'

defineProps<{
  isMobile: boolean
  responsiveCols: string
}>()
</script>

<template>
  <div class="detail-skeleton">
    <!-- 主要信息区 -->
    <div class="detail-hero">
      <Skeleton type="rect" :width="isMobile ? '100%' : '180px'" height="248px" />
      <div class="detail-info">
        <Skeleton width="70%" height="24px" />
        <Skeleton width="50%" height="15px" />
        <div class="detail-meta">
          <Skeleton width="68px" height="22px" />
          <Skeleton width="68px" height="22px" />
          <Skeleton width="68px" height="22px" />
        </div>
        <Skeleton :rows="3" />
      </div>
    </div>

    <!-- 次要信息区 -->
    <div class="detail-section">
      <Skeleton width="104px" height="20px" />
      <NGrid :x-gap="12" :y-gap="12" :cols="responsiveCols" responsive="screen">
        <NGi v-for="i in 6" :key="i">
          <Skeleton type="rect" height="140px" />
        </NGi>
      </NGrid>
    </div>
  </div>
</template>

<style scoped>
.detail-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.detail-hero {
  display: flex;
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .detail-hero {
    flex-direction: column;
  }
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detail-meta {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
