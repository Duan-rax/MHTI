<script setup lang="ts">
/**
 * StatusBadge — 状态徽章
 *
 * 结构：一个语义色圆点 + 文字，底色取该语义色的 50 档浅底。
 * 颜色全部走 CSS 令牌类（见下），不再用内联十六进制 —— 旧实现把 iOS 色值写死在
 * JS 里，暗色模式下浅底与文字色无法自适应，且与设计令牌体系脱节。
 *
 * 动效收敛：只保留"进行中"状态的呼吸（透明度 0.45↔1，2.4s）。
 * 原先的旋转/闪烁/光晕三种动画在信息密度高的列表里会持续争夺注意力，
 * 且旋转与闪烁并不表达"进度"，属于装饰而非信息。
 */
import { computed } from 'vue'
import type { Component } from 'vue'

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default'
export type BadgeSize = 'small' | 'medium' | 'large'

const props = withDefaults(
  defineProps<{
    /** 状态类型 */
    status?: BadgeStatus
    /** 徽章文本 */
    text?: string
    /** 尺寸 */
    size?: BadgeSize
    /** 进行中状态的呼吸提示 */
    pulse?: boolean
    /** 仅显示圆点（不显示文字与底色） */
    dot?: boolean
    /** 自定义图标（替代圆点） */
    icon?: Component
    /** 胶囊形（否则为小圆角矩形） */
    round?: boolean
  }>(),
  {
    status: 'default',
    size: 'medium',
    pulse: false,
    dot: false,
    round: true,
  },
)

const badgeClass = computed(() => ({
  'badge': true,
  'is-dot-only': props.dot,
  'is-round': props.round,
  'is-pulse': props.pulse && !props.dot,
  [`badge--${props.status}`]: true,
  [`badge--${props.size}`]: true,
}))
</script>

<template>
  <span :class="badgeClass">
    <span v-if="dot" class="badge-dot-only" aria-hidden="true" />
    <template v-else>
      <component :is="icon" v-if="icon" class="badge-icon" />
      <span v-else class="badge-dot" aria-hidden="true" />
      <span v-if="text" class="badge-text">{{ text }}</span>
      <slot v-else />
    </template>
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: var(--weight-medium);
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  color: var(--tone-fg);
  background: var(--tone-bg);
}

/* -------------------- 语义色（每色两档：浅底 / 主色） -------------------- */
.badge--success {
  --tone-bg: var(--success-50);
  --tone-fg: var(--success-500);
}

.badge--warning {
  --tone-bg: var(--warning-50);
  --tone-fg: var(--warning-500);
}

.badge--error {
  --tone-bg: var(--danger-50);
  --tone-fg: var(--danger-500);
}

.badge--info {
  --tone-bg: var(--info-50);
  --tone-fg: var(--info-500);
}

.badge--pending {
  --tone-bg: var(--brand-50);
  --tone-fg: var(--brand-500);
}

.badge--default {
  --tone-bg: var(--bg-hover);
  --tone-fg: var(--text-2);
}

/* -------------------- 尺寸 -------------------- */
.badge--small {
  height: 20px;
  padding: 0 6px;
  font-size: var(--text-xs);
  border-radius: var(--radius-xs);
}

.badge--medium {
  height: 24px;
  padding: 0 8px;
  font-size: var(--text-xs);
  border-radius: var(--radius-xs);
}

.badge--large {
  height: 28px;
  padding: 0 10px;
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
}

.badge.is-round {
  border-radius: var(--radius-full);
}

/* -------------------- 指示点 -------------------- */
.badge-dot,
.badge-dot-only {
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--tone-fg);
}

.badge--small .badge-dot {
  width: 5px;
  height: 5px;
}

.badge--medium .badge-dot {
  width: 6px;
  height: 6px;
}

.badge--large .badge-dot {
  width: 7px;
  height: 7px;
}

.badge-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* 仅圆点：无底色无内边距，用作列表行内的极简状态标记 */
.badge.is-dot-only {
  padding: 0;
  background: none;
  height: auto;
}

.badge--small .badge-dot-only {
  width: 6px;
  height: 6px;
}

.badge--medium .badge-dot-only {
  width: 8px;
  height: 8px;
}

.badge--large .badge-dot-only {
  width: 10px;
  height: 10px;
}

/* -------------------- 进行中呼吸 -------------------- */
.badge.is-pulse .badge-dot {
  animation: badge-breathe 2.4s var(--ease-in-out) infinite;
}

@keyframes badge-breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
