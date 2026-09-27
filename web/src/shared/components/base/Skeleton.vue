<script setup lang="ts">
/**
 * Skeleton — 单个骨架基元
 *
 * 只负责尺寸与形状，闪烁效果由全局 `.skeleton-block` 提供
 * （见 shared/styles/global.css），避免每个骨架组件各写一份 keyframes。
 */
withDefaults(
  defineProps<{
    type?: 'text' | 'circle' | 'rect' | 'card'
    width?: string
    height?: string
    /** text 类型的行数；末行按 60% 收窄，视觉上更像段落 */
    rows?: number
  }>(),
  { type: 'text' },
)

/** 圆角按形状取值，与组件库其余部分使用同一套档位 */
const shapeClass = (type: string) => ({
  'is-circle': type === 'circle',
  'is-rect': type === 'rect' || type === 'card',
})
</script>

<template>
  <div class="skeleton-wrap">
    <!-- 文本：多行时逐行等距堆叠 -->
    <template v-if="type === 'text'">
      <div
        v-for="i in rows || 1"
        :key="i"
        class="skeleton-block skeleton-item"
        :class="shapeClass('text')"
        :style="{
          width: i === rows && (rows || 1) > 1 ? '60%' : width || '100%',
          height: height || '14px',
        }"
      />
    </template>

    <div
      v-else-if="type === 'circle'"
      class="skeleton-block skeleton-item"
      :class="shapeClass(type)"
      :style="{ width: width || '40px', height: height || '40px' }"
    />

    <div
      v-else-if="type === 'rect'"
      class="skeleton-block skeleton-item"
      :class="shapeClass(type)"
      :style="{ width: width || '100%', height: height || '96px' }"
    />

    <!-- 卡片：图 + 两行文字，与真实卡片骨架对齐，避免加载完发生跳动 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-block skeleton-item is-rect" style="height: 96px" />
      <div class="skeleton-block skeleton-item" style="width: 70%; height: 14px" />
      <div class="skeleton-block skeleton-item" style="width: 45%; height: 14px" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-item.is-circle {
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.skeleton-item.is-rect {
  border-radius: var(--radius-md);
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
