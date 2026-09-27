<script setup lang="ts">
/**
 * MobileTabBar — 移动端底部导航
 *
 * 项由路由 meta 派生（唯一真源见 router/shell.ts）。移动端不设抽屉：
 * 一级导航共 5 项，底部平铺即可全覆盖，少一层交互路径。
 *
 * 触摸反馈用 0.98 缩放 + 轻微触觉震动；图标的"实心/描边"切换即激活态，
 * 不再额外加背景块，保持底部条干净。
 */
import { computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import { buildTabEntries, isNavActive } from '@/router/menu'

const route = useRoute()
const router = useRouter()

const tabs = computed(() =>
  buildTabEntries()
    .filter((entry) => entry.icon && entry.iconActive)
    .map((entry) => ({
      path: entry.path,
      label: entry.tabLabel ?? entry.title,
      icon: entry.icon as Component,
      iconActive: entry.iconActive as Component,
    })),
)

/** 详情页等子路由也要点亮父 Tab（判定逻辑见 router/menu.isNavActive） */
function isActive(path: string): boolean {
  return isNavActive(path, route.path)
}

function go(path: string) {
  if (isActive(path)) return
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(10)
    } catch {
      // 部分浏览器在无用户手势时抛错，忽略即可
    }
  }
  router.push(path)
}
</script>

<template>
  <nav class="tabbar" aria-label="主导航">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      type="button"
      class="tabbar-item"
      :class="{ 'is-active': isActive(tab.path) }"
      :aria-current="isActive(tab.path) ? 'page' : undefined"
      @click="go(tab.path)"
    >
      <NIcon :size="21" :component="isActive(tab.path) ? tab.iconActive : tab.icon" />
      <span class="tabbar-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-tabbar);
  display: flex;
  align-items: stretch;
  height: var(--shell-tabbar-h);
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: var(--bg-surface);
  border-top: 1px solid var(--border-1);
}

.tabbar-item {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--duration-fast) var(--ease-in-out),
    transform var(--duration-fast) var(--ease-in-out);
}

.tabbar-item:active {
  transform: scale(0.94);
}

.tabbar-item.is-active {
  color: var(--brand-500);
}

.tabbar-label {
  font-size: 11px;
  font-weight: var(--weight-medium);
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 横屏矮屏：压缩高度，避免占掉过多可视区 */
@media (orientation: landscape) and (max-height: 500px) {
  .tabbar {
    height: 48px;
  }

  .tabbar-label {
    font-size: 10px;
  }
}
</style>
