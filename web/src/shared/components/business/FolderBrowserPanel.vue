<script setup lang="ts">
/**
 * FolderBrowserPanel — 目录浏览主体（供 FolderBrowserModal 使用）
 *
 * 面包屑 + 搜索 + 目录列表（含返回上级 / 空态）+ 当前选择。
 * 纯展示：目录数据来自 useFolderBrowser（父组件持有），导航与进入动作经事件上抛；
 * filter 也由父组件持有，因为弹窗每次打开需要重置。
 *
 * 样式修正：原先多处使用 `--n-color-embedded` / `--n-border-color`，这两个变量
 * 只在 NCard 等组件的根元素子树内可达（CLAUDE.md 陷阱 #5），一旦换个挂载位置
 * 就会静默失效；「已选择」条还用了渐变底色。现统一改为设计令牌与纯色底。
 */
import { computed } from 'vue'
import { NIcon, NInput, NSpin } from 'naive-ui'
import {
  ArrowUpOutline,
  ChevronForwardOutline,
  CloudOutline,
  FolderOutline,
  SearchOutline,
} from '@vicons/ionicons5'
import type { DirectoryEntry, StorageProvider } from '@/shared/types/common'

const props = defineProps<{
  loading: boolean
  currentPath: string
  parentPath: string | null
  currentProvider: StorageProvider
  directories: DirectoryEntry[]
  selectedPath: string
  filter: string
}>()

const emit = defineEmits<{
  'update:filter': [value: string]
  /** 面包屑跳转（'' 表示根目录） */
  navigate: [path: string]
  up: []
  enter: [entry: DirectoryEntry]
}>()

const filteredDirs = computed(() => {
  if (!props.filter) return props.directories
  const keyword = props.filter.toLowerCase()
  return props.directories.filter((d) => d.name.toLowerCase().includes(keyword))
})

const pathSegments = computed(() => {
  if (!props.currentPath) return []
  const segments: { name: string; path: string }[] = []
  let path = ''
  for (const part of props.currentPath.split('/').filter(Boolean)) {
    path += '/' + part
    segments.push({ name: part, path })
  }
  return segments
})
</script>

<template>
  <div class="panel">
    <!-- 面包屑 -->
    <nav class="crumbs" aria-label="目录路径">
      <button type="button" class="crumb" @click="emit('navigate', '')">
        <NIcon :component="FolderOutline" :size="13" />
        根目录
      </button>
      <template v-for="(seg, idx) in pathSegments" :key="seg.path">
        <NIcon :component="ChevronForwardOutline" :size="12" class="crumb-sep" />
        <button
          type="button"
          class="crumb"
          :class="{ 'is-current': idx === pathSegments.length - 1 }"
          :aria-current="idx === pathSegments.length - 1 ? 'location' : undefined"
          @click="emit('navigate', seg.path)"
        >
          {{ seg.name }}
        </button>
      </template>
    </nav>

    <NInput
      :value="filter"
      placeholder="搜索文件夹"
      clearable
      @update:value="emit('update:filter', $event)"
    >
      <template #prefix>
        <NIcon :component="SearchOutline" :size="15" />
      </template>
    </NInput>

    <NSpin :show="loading">
      <div class="list">
        <!-- 返回上级 -->
        <button
          v-if="parentPath !== null || currentProvider === '115'"
          type="button"
          class="row"
          @click="emit('up')"
        >
          <span class="row-icon is-back">
            <NIcon :component="ArrowUpOutline" :size="15" />
          </span>
          <span class="row-name">返回上级</span>
        </button>

        <p v-if="filteredDirs.length === 0 && !loading" class="empty">
          {{ filter ? '没有匹配的文件夹' : '此目录下没有子文件夹' }}
        </p>

        <button
          v-for="entry in filteredDirs"
          :key="entry.path"
          type="button"
          class="row"
          @click="emit('enter', entry)"
        >
          <span class="row-icon" :class="{ 'is-cloud': entry.is_virtual }">
            <NIcon :component="entry.is_virtual ? CloudOutline : FolderOutline" :size="15" />
          </span>
          <span class="row-name">{{ entry.name }}</span>
          <NIcon :component="ChevronForwardOutline" :size="14" class="row-arrow" />
        </button>
      </div>
    </NSpin>

    <!-- 当前选择：实心浅底，不再用渐变 -->
    <p class="current">
      <span class="current-label">将选择</span>
      <span class="current-path">{{ selectedPath || '尚未选择目录' }}</span>
    </p>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* -------------------- 面包屑 -------------------- */
.crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.crumb {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-in-out),
    color var(--duration-fast) var(--ease-in-out);
}

.crumb:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}

.crumb.is-current {
  color: var(--text-1);
  font-weight: var(--weight-medium);
}

.crumb-sep {
  color: var(--text-3);
  flex-shrink: 0;
}

/* -------------------- 目录列表 -------------------- */
.list {
  height: 280px;
  overflow-y: auto;
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none;
  border-bottom: 1px solid var(--border-1);
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.row:last-child {
  border-bottom: none;
}

.row:hover {
  background: var(--bg-hover);
}

.row-icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  /* 目录用暖色、云端用信息色：同一列表里两种来源要能一眼区分 */
  background: var(--warning-50);
  color: var(--warning-500);
}

.row-icon.is-cloud {
  background: var(--info-50);
  color: var(--info-500);
}

.row-icon.is-back {
  background: var(--brand-50);
  color: var(--brand-500);
}

.row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-base);
  color: var(--text-1);
}

/* 前进箭头默认隐藏，悬停才出现：列表静止时保持干净 */
.row-arrow {
  color: var(--text-3);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

.row:hover .row-arrow {
  opacity: 1;
}

.empty {
  padding: var(--space-10) var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-2);
}

/* -------------------- 当前选择 -------------------- */
.current {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  margin: 0;
  background: var(--bg-subtle);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.current-label {
  flex-shrink: 0;
  color: var(--text-2);
}

.current-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-1);
}
</style>
