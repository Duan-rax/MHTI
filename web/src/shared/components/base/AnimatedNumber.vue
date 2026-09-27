<script setup lang="ts">
/**
 * AnimatedNumber — 数字滚动展示
 *
 * 修正原实现的一个真实缺陷：原代码在 onMounted 时从 0 动画到目标值，
 * 而 requestAnimationFrame 在标签页/面板不可见时会被冻结，
 * 于是"打开页面时后台标签页没动画完"就会长期停在 0（CLAUDE.md 已知陷阱 #8）。
 * 现在初始即显示目标值，仅在**后续值变化**时做一次滚动，语义也更正确：
 * 动画表达的是"数据变了"，而不是"页面刚打开"。
 *
 * 同时尊重系统"减少动态效果"：此时直接赋值，不做补间。
 */
import { onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    /** 补间时长，缺省 600ms */
    duration?: number
  }>(),
  { duration: 600 },
)

const displayValue = ref(props.value)
let frameId: number | null = null

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** easeOutCubic：起步快、收尾缓，读数停止得干脆 */
function easeOut(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}

function animate(from: number, to: number) {
  if (frameId !== null) cancelAnimationFrame(frameId)

  if (prefersReducedMotion()) {
    displayValue.value = to
    return
  }

  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min((now - start) / props.duration, 1)
    displayValue.value = Math.round(from + (to - from) * easeOut(progress))
    frameId = progress < 1 ? requestAnimationFrame(step) : null
  }
  frameId = requestAnimationFrame(step)
}

watch(
  () => props.value,
  (to, from) => animate(from ?? to, to),
)

onUnmounted(() => {
  if (frameId !== null) cancelAnimationFrame(frameId)
})
</script>

<template>
  <span class="animated-number tabular">{{ displayValue }}</span>
</template>

<style scoped>
.animated-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
</style>
