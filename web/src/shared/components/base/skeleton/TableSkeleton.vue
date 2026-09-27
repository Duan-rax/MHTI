<script setup lang="ts">
/**
 * 页面骨架屏 - 表格预设
 *
 * 640px 以下隐藏第 3/4 列（移动端列裁剪）随本组件。
 */
import Skeleton from '@/shared/components/base/Skeleton.vue'

defineProps<{
  count: number
}>()
</script>

<template>
  <div class="surface table-skeleton-card">
    <!-- 工具栏 -->
    <div class="table-toolbar-skeleton">
      <Skeleton width="180px" height="32px" />
      <div class="table-actions">
        <Skeleton width="88px" height="32px" />
        <Skeleton width="88px" height="32px" />
      </div>
    </div>
    <!-- 表头 -->
    <div class="table-header-skeleton">
      <Skeleton width="5%" height="20px" />
      <Skeleton width="30%" height="20px" />
      <Skeleton width="15%" height="20px" />
      <Skeleton width="15%" height="20px" />
      <Skeleton width="20%" height="20px" />
      <Skeleton width="15%" height="20px" />
    </div>
    <!-- 表格行 -->
    <div v-for="i in count" :key="i" class="table-row-skeleton">
      <Skeleton width="5%" height="18px" />
      <Skeleton width="30%" height="18px" />
      <Skeleton width="15%" height="18px" />
      <Skeleton width="15%" height="18px" />
      <Skeleton width="20%" height="18px" />
      <Skeleton width="15%" height="28px" />
    </div>
    <!-- 分页 -->
    <div class="table-pagination-skeleton">
      <Skeleton width="180px" height="30px" />
    </div>
  </div>
</template>

<style scoped>
.table-skeleton-card {
  padding: var(--space-4) var(--space-5);
}

.table-toolbar-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.table-actions {
  display: flex;
  gap: var(--space-3);
}

.table-header-skeleton,
.table-row-skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.table-header-skeleton {
  border-bottom: 1px solid var(--border-1);
}

.table-row-skeleton {
  border-bottom: 1px solid var(--border-1);
}

.table-pagination-skeleton {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-4);
}

/* 移动端隐藏表格某些列 */
@media (max-width: 640px) {
  .table-header-skeleton > :nth-child(3),
  .table-header-skeleton > :nth-child(4),
  .table-row-skeleton > :nth-child(3),
  .table-row-skeleton > :nth-child(4) {
    display: none;
  }
}
</style>
