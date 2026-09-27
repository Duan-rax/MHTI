<script setup lang="ts">
/**
 * PageContainer — 页面骨架
 *
 * 结构（自上而下）：
 *   ① 页头：标题 + 副标题 + 操作区（`actions` 槽），仅在有操作时渲染右侧
 *   ② 工具行：搜索/筛选/批量操作（`filters` 槽，可选）
 *   ③ 内容：默认槽
 *   ④ 弹窗/抽屉：页面在容器之后平铺声明，不放进容器（避免被过渡与限宽影响）
 *
 * 设计取舍：**不再把整页包进一张大卡片**。旧实现的"白底大卡 + 圆角 + 阴影"
 * 让内容与页面底之间没有层次，也吃掉了横向空间；现在页头直接落在页面底上，
 * 内容块各自按需用 `.surface` 表达边界，层次由留白与分隔线建立。
 *
 * 标题与副标题默认取当前路由 meta（唯一真源 router/shell.ts），
 * 页面仅在需要覆盖时显式传入。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  /** 覆盖路由 meta 的标题 */
  title?: string
  /** 覆盖路由 meta 的副标题 */
  subtitle?: string
}>()

const route = useRoute()

const resolvedTitle = computed(() => props.title ?? route.meta.title ?? '')
const resolvedSubtitle = computed(() => props.subtitle ?? route.meta.subtitle ?? '')
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="page-heading">
        <h1 class="page-title">{{ resolvedTitle }}</h1>
        <p v-if="resolvedSubtitle" class="page-subtitle">{{ resolvedSubtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.filters" class="page-toolbar">
      <slot name="filters" />
    </div>

    <div class="page-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* -------------------- 页头 -------------------- */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.page-heading {
  min-width: 0;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--text-1);
}

/* 副标题与标题拉开一档字号（20 → 13），层次靠对比而非颜色 */
.page-subtitle {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  color: var(--text-2);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* -------------------- 工具行 -------------------- */
.page-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.page-body {
  min-width: 0;
}

/* -------------------- 移动端：操作区换行到标题下方 -------------------- */
@media (max-width: 767px) {
  .page {
    gap: var(--space-4);
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }

  .page-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
