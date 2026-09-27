<script setup lang="ts">
/**
 * 设置分组卡（settings 域私有版式件）
 *
 * 只负责版式与状态，不碰数据：给所有设置面板同一套「标题 / 说明 / 字段区 / 操作区」，
 * 并且把「加载中 / 加载失败（可重试）/ 保存失败」这三种状态收在组件里，
 * 免得 11 个面板各写一份（原先加载失败只有 console.error，页面上看不到任何原因）。
 *
 * 状态互斥：加载失败时说明区让位给错误条，字段区与操作区都不渲染——避免用户对着
 * 一份没加载出来的表单点保存。
 */
import type { Component } from 'vue'
import { NButton, NCard, NIcon, NSkeleton } from 'naive-ui'
import { AlertCircleOutline } from '@vicons/ionicons5'

defineProps<{
  title: string
  /** 一句话说明这个分组管什么（可选，写在这一组字段上方） */
  description?: string
  /** 头部图标（可选）：与标题同色同字号，不做彩色强调 */
  icon?: Component
  /** 加载中：铺 3 行骨架，保持卡片高度不跳 */
  loading?: boolean
  /** 加载失败：整卡替换为错误条 + 重试 */
  error?: string
  /** 非阻塞提示（如状态读取失败但还能继续操作）：渲染在字段区上方 */
  notice?: string
  /** 操作失败：渲染在操作区上方，保留已填内容 */
  actionError?: string
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <NCard class="settings-section">
    <template #header>
      <div class="section-head">
        <NIcon v-if="icon" :component="icon" :size="20" />
        <span class="section-title">{{ title }}</span>
        <div v-if="$slots['header-extra']" class="header-extra">
          <slot name="header-extra" />
        </div>
      </div>
    </template>

    <p v-if="description" class="section-desc">{{ description }}</p>

    <div v-if="error" class="section-error" role="alert">
      <NIcon :component="AlertCircleOutline" :size="16" />
      <span class="error-text">{{ error }}</span>
      <NButton size="tiny" @click="emit('retry')">重试</NButton>
    </div>

    <div v-else-if="loading" class="section-skeleton" aria-busy="true">
      <NSkeleton text style="width: 40%" />
      <NSkeleton text style="width: 65%" />
      <NSkeleton text style="width: 55%" />
    </div>

    <template v-else>
      <p v-if="notice" class="section-notice" role="alert">
        <NIcon :component="AlertCircleOutline" :size="16" />
        <span class="error-text">{{ notice }}</span>
      </p>

      <div class="section-body">
        <slot />
      </div>

      <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

      <div v-if="$slots.actions" class="section-actions">
        <slot name="actions" />
      </div>
    </template>
  </NCard>
</template>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

/* 头部右侧动作（刷新 / 清理 / 导出等） */
.header-extra {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-left: auto;
  font-weight: var(--weight-normal);
}

.section-desc {
  margin: 0 0 var(--space-4);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

.section-notice {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
  padding: var(--space-2) var(--space-3);
  border-left: 2px solid var(--warning-500);
  font-size: var(--text-sm);
  color: var(--warning-500);
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-left: 2px solid var(--danger-500);
  font-size: var(--text-sm);
  color: var(--danger-500);
}

.error-text {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.action-error {
  margin: var(--space-4) 0 0;
  padding: var(--space-2) var(--space-3);
  border-left: 2px solid var(--danger-500);
  font-size: var(--text-sm);
  color: var(--danger-500);
  overflow-wrap: anywhere;
}

.section-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-5);
}
</style>
