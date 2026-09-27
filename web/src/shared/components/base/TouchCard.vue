<script setup lang="ts">
/**
 * TouchCard — 可点击卡片（含触摸按压反馈）
 *
 * 手势逻辑（按压 / 点击判定 / 鼠标降级 / 命中交互元素时不触发卡片点击）
 * 见 shared/composables/useTouchGesture，本组件只负责外观与插槽。
 *
 * 已移除的 props（全仓零消费，且 glass 的 backdrop-filter 与新设计语言相悖）：
 * glass / size / touchFeedback，以及 header、header-extra、footer、action 四个
 * 从未被使用的插槽。卡片样式统一由 .surface 令牌表达，不再需要尺寸变体。
 */
import { computed } from 'vue'
import { useMobileLayout } from '@/shared/composables/useMobileLayout'
import { useTouchGesture } from '@/shared/composables/useTouchGesture'

const props = withDefaults(
  defineProps<{
    /** 是否可点击（决定光标与悬停反馈） */
    clickable?: boolean
    /** 是否禁用交互 */
    disabled?: boolean
  }>(),
  { clickable: false, disabled: false },
)

const emit = defineEmits<{
  click: [event: MouseEvent | TouchEvent]
}>()

const { isTouchDevice } = useMobileLayout()

const {
  isPressed,
  handleTouchStart,
  handleTouchEnd,
  handleTouchCancel,
  handleClick,
  handleMouseDown,
  handleMouseUp,
  handleMouseLeave,
} = useTouchGesture({
  clickable: () => props.clickable,
  touchFeedback: () => true,
  disabled: () => props.disabled,
  isTouchDevice,
  onTap: (event) => emit('click', event),
})

const cardClass = computed(() => ({
  'touch-card': true,
  'is-pressed': isPressed.value,
  'is-clickable': props.clickable,
  'is-disabled': props.disabled,
}))
</script>

<template>
  <div
    :class="cardClass"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <div class="touch-card-body">
      <slot />
    </div>
    <slot name="suffix" />
  </div>
</template>

<style scoped>
.touch-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
  -webkit-tap-highlight-color: transparent;
  transition:
    border-color var(--duration-fast) var(--ease-in-out),
    background-color var(--duration-fast) var(--ease-in-out);
}

.touch-card-body {
  flex: 1;
  min-width: 0;
}

/* 可点击：悬停只改描边与底色，不做位移/投影。列表里几十张卡片同时"抬头"很吵 */
.touch-card.is-clickable {
  cursor: pointer;
}

.touch-card.is-clickable:hover {
  border-color: var(--border-2);
  background: var(--bg-hover);
}

.touch-card.is-pressed {
  background: var(--bg-active);
}

.touch-card.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
