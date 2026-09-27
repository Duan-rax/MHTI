<script setup lang="ts">
/**
 * 移动端文件行（FilesPage 移动视图）
 *
 * 图标 + 名称 + 大小/时间 + 后缀操作区。卡片本体点击（含手势判定与"命中交互
 * 元素时不触发卡片点击"）由 TouchCard / useTouchGesture 处理，进入目录动作经
 * open 事件上抛。
 *
 * 视觉取舍：
 * - 行不再自带描边与圆角：它落在页面的卡片里，行再画一圈边界就是卡中卡，
 *   行与行之间改由父级的发丝分隔线划分（见 FilesPage 的 .row-list）。
 * - 只有目录行给可点击反馈：文件行点进去没有下一层，画个手型光标是骗人。
 */
import { NButton, NIcon } from 'naive-ui'
import { AddOutline, ChevronForwardOutline, DocumentOutline, FolderOutline } from '@vicons/ionicons5'
import type { DirectoryEntry } from '@/shared/types/common'
import TouchCard from '@/shared/components/base/TouchCard.vue'
import { formatSize, formatTime } from '@/modules/library/utils'

defineProps<{
  entry: DirectoryEntry
}>()

const emit = defineEmits<{
  open: [entry: DirectoryEntry]
  create: [entry: DirectoryEntry]
}>()
</script>

<template>
  <TouchCard
    :clickable="entry.is_dir"
    class="file-card"
    @click="emit('open', entry)"
  >
    <div class="row-main">
      <span class="row-icon" :class="{ 'is-folder': entry.is_dir }" aria-hidden="true">
        <NIcon :component="entry.is_dir ? FolderOutline : DocumentOutline" :size="20" />
      </span>
      <div class="row-text">
        <div class="row-name truncate">{{ entry.name }}</div>
        <div class="row-meta">
          <span v-if="entry.size !== null">{{ formatSize(entry.size) }}</span>
          <span v-if="entry.mtime">{{ formatTime(entry.mtime) }}</span>
        </div>
      </div>
    </div>
    <template #suffix>
      <div class="row-actions">
        <NButton
          v-if="entry.is_dir"
          size="tiny"
          quaternary
          circle
          aria-label="用此目录创建任务"
          @click.stop="emit('create', entry)"
        >
          <template #icon>
            <NIcon :component="AddOutline" />
          </template>
        </NButton>
        <NIcon
          v-if="entry.is_dir"
          :component="ChevronForwardOutline"
          class="chevron"
          aria-hidden="true"
        />
      </div>
    </template>
  </TouchCard>
</template>

<style scoped>
.row-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

/* 图标底色只在目录上给语义（暖色 = 可进入）；文件保持无底色，
 * 浅色下 --bg-subtle 与卡面几乎同色，画个看不见的框不如不画 */
.row-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--text-3);
}

.row-icon.is-folder {
  background: rgb(var(--warning-rgb) / 12%);
  color: var(--warning-500);
}

.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-name {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
  color: var(--text-1);
}

.row-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.chevron {
  font-size: 18px;
  color: var(--text-3);
}
</style>
