<script setup lang="ts">
/**
 * 页面骨架屏 - 列表预设
 */
import Skeleton from '@/shared/components/base/Skeleton.vue'

defineProps<{
  count: number
}>()
</script>

<template>
  <div class="list-skeleton">
    <div v-for="i in count" :key="i" class="list-item-skeleton">
      <Skeleton type="circle" width="40px" height="40px" />
      <div class="list-item-content">
        <Skeleton width="60%" height="15px" />
        <Skeleton width="40%" height="13px" />
      </div>
      <Skeleton width="72px" height="28px" />
    </div>
  </div>
</template>

<style scoped>
.list-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.list-item-skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
}

.list-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
