<script setup lang="ts">
/**
 * BarChart — 极简柱状图（纯 CSS，无图表库）
 *
 * 设计取舍：
 * - 单色柱体，不用渐变。渐变色柱在这里不传达任何额外信息，只是把"数据"涂成"装饰"。
 * - 不再逐柱 scaleY 生长 + 错峰延迟。那是入场动画，会持续数秒干扰阅读；
 *   改为图表整体 200ms 淡入，数据本身即刻可读。
 * - 悬停显示数值：柱高只表达相对量级，精确值仍需要能读出来。
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: { label: string; value: number }[]
    height?: number
    /** 柱体颜色，缺省用品牌主色 */
    color?: string
  }>(),
  { height: 120 },
)

/** 全零数据时用 1 兜底，避免除零把柱高算成 NaN */
const maxValue = computed(() => Math.max(...props.data.map((item) => item.value), 1))
const barColor = computed(() => props.color ?? 'var(--brand-500)')

function barHeight(value: number): string {
  // 非零值保底 4px，否则"有 1 条记录"和"没有记录"看起来一样
  if (value === 0) return '0px'
  return `max(4px, ${(value / maxValue.value) * 100}%)`
}
</script>

<template>
  <div class="chart" :style="{ height: `${height}px` }">
    <!-- 绘图区：整条基线由容器给，避免被列间距切成虚线 -->
    <div class="plot">
      <div v-for="(item, index) in data" :key="index" class="col">
        <span class="col-value tabular">{{ item.value }}</span>
        <div class="col-bar" :style="{ height: barHeight(item.value), background: barColor }" />
      </div>
    </div>

    <div class="labels">
      <span v-for="(item, index) in data" :key="index" class="col-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  animation: chart-in var(--duration-normal) var(--ease-out);
}

@keyframes chart-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 绘图区：基线是给柱体一个可比较的基准，比悬空浮着更容易读 */
.plot {
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: flex-end;
  gap: var(--space-2);
  border-bottom: 1px solid var(--border-1);
}

.col {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
}

.col-bar {
  width: 100%;
  max-width: 36px;
  border-radius: var(--radius-xs) var(--radius-xs) 0 0;
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

.col-value {
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-2);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

/* 悬停整列而非单根柱子：命中区域更大，且知道"读的是哪一天" */
.col:hover .col-value {
  opacity: 1;
}

.col:hover .col-bar {
  opacity: 0.75;
}

/* 标签行与绘图区同宽同分栏，保证标签对齐到对应柱体 */
.labels {
  display: flex;
  gap: var(--space-2);
}

.col-label {
  flex: 1;
  min-width: 0;
  font-size: var(--text-xs);
  color: var(--text-2);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
