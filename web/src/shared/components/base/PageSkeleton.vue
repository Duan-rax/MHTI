<script setup lang="ts">
import { computed } from 'vue'
import Skeleton from './Skeleton.vue'
import { useMobileLayout } from '@/shared/composables/useMobileLayout'
import ListSkeleton from '@/shared/components/base/skeleton/ListSkeleton.vue'
import GridSkeleton from '@/shared/components/base/skeleton/GridSkeleton.vue'
import CardsSkeleton from '@/shared/components/base/skeleton/CardsSkeleton.vue'
import DetailSkeleton from '@/shared/components/base/skeleton/DetailSkeleton.vue'
import FormSkeleton from '@/shared/components/base/skeleton/FormSkeleton.vue'
import TableSkeleton from '@/shared/components/base/skeleton/TableSkeleton.vue'

/**
 * 页面骨架屏组件
 * 支持多种页面布局预设，自动适配移动端
 *
 * 预设内容已按类型拆到 ./skeleton/ 子目录，本文件只保留壳、标题区
 * 与预设分发。
 */

export type SkeletonPreset = 'list' | 'grid' | 'detail' | 'form' | 'table' | 'cards'

const props = withDefaults(defineProps<{
  /** 预设布局类型 */
  preset?: SkeletonPreset
  /** 列表/网格项数量 */
  count?: number
  /** 是否显示标题区域 */
  showHeader?: boolean
  /** 网格列数（仅 grid/cards 预设） */
  cols?: number
}>(), {
  preset: 'list',
  count: 5,
  showHeader: true,
  cols: 3,
})

const { isMobile } = useMobileLayout()

// 响应式列数字符串（Naive UI 格式）
const responsiveCols = computed(() => `1 s:2 m:${props.cols}`)
</script>

<template>
  <div class="page-skeleton">
    <!-- 页头骨架：尺寸对齐 PageContainer 的标题（20px）与副标题（13px） -->
    <div v-if="showHeader" class="page-header-skeleton">
      <Skeleton width="180px" height="20px" />
      <Skeleton width="280px" height="13px" />
    </div>

    <!-- 列表预设 -->
    <ListSkeleton v-if="preset === 'list'" :count="count" />

    <!-- 网格预设 -->
    <GridSkeleton v-else-if="preset === 'grid'" :count="count" :responsive-cols="responsiveCols" />

    <!-- 卡片预设（带图标） -->
    <CardsSkeleton v-else-if="preset === 'cards'" :count="count" :responsive-cols="responsiveCols" />

    <!-- 详情页预设 -->
    <DetailSkeleton v-else-if="preset === 'detail'" :is-mobile="isMobile" :responsive-cols="responsiveCols" />

    <!-- 表单预设 -->
    <FormSkeleton v-else-if="preset === 'form'" :count="count" />

    <!-- 表格预设 -->
    <TableSkeleton v-else-if="preset === 'table'" :count="count" />
  </div>
</template>

<style scoped>
.page-skeleton {
  width: 100%;
}

/* 限宽与居中已由 AppLayout 的内容区负责，此处不再重复设置 */
.page-header-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
</style>