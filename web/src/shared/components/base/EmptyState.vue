<script setup lang="ts">
/**
 * EmptyState — 空状态
 *
 * 设计取舍：不用 200×160 的大插画。大面积浅色图形会占据半屏却不传达信息，
 * 反而让"其实什么都没发生"看起来像"页面出了问题"。
 * 改为 56px 图标 + 一句话说明 + 一个明确动作，把注意力留给动作本身。
 */
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import {
  AlertCircleOutline,
  AddOutline,
  DocumentTextOutline,
  SearchOutline,
} from '@vicons/ionicons5'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    actionText?: string
    icon?: 'empty' | 'search' | 'error'
  }>(),
  { icon: 'empty' },
)

const emit = defineEmits<{
  action: []
}>()

const ICON_MAP = {
  empty: DocumentTextOutline,
  search: SearchOutline,
  error: AlertCircleOutline,
} as const

const resolved = computed(() => ({
  icon: ICON_MAP[props.icon ?? 'empty'],
  title: props.title ?? '暂无数据',
  description: props.description ?? '这里还没有任何内容',
}))
</script>

<template>
  <div class="empty">
    <span class="empty-icon" :class="`is-${icon}`" aria-hidden="true">
      <NIcon :component="resolved.icon" :size="26" />
    </span>
    <h3 class="empty-title">{{ resolved.title }}</h3>
    <p class="empty-desc">{{ resolved.description }}</p>
    <NButton v-if="actionText" type="primary" @click="emit('action')">
      <template #icon>
        <NIcon :component="AddOutline" :size="16" />
      </template>
      {{ actionText }}
    </NButton>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

/* 图标底色即语义：错误态用危险色，避免"出错了"和"没数据"长得一样 */
.empty-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: var(--space-4);
  border-radius: var(--radius-full);
  background: var(--brand-50);
  color: var(--brand-500);
}

.empty-icon.is-error {
  background: var(--danger-50);
  color: var(--danger-500);
}

.empty-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-1);
}

.empty-desc {
  margin: var(--space-2) 0 0;
  max-width: 320px;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

/* 有动作时留出与说明文字的间距；无动作时不产生多余空白 */
.empty > :deep(.n-button) {
  margin-top: var(--space-5);
}

@media (max-width: 767px) {
  .empty {
    padding: var(--space-8) var(--space-4);
  }
}
</style>
