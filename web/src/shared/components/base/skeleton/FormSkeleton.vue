<script setup lang="ts">
/**
 * 页面骨架屏 - 表单预设
 */
import Skeleton from '@/shared/components/base/Skeleton.vue'

defineProps<{
  count: number
}>()
</script>

<template>
  <div class="surface form-skeleton-card">
    <div class="form-skeleton">
      <div v-for="i in count" :key="i" class="form-field-skeleton">
        <Skeleton width="100px" height="16px" />
        <Skeleton width="100%" height="36px" />
      </div>
      <div class="form-actions">
        <Skeleton width="108px" height="36px" />
        <Skeleton width="88px" height="36px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-skeleton-card {
  max-width: 600px;
  padding: var(--space-5);
}

.form-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-field-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>
