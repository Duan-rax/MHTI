<script setup lang="ts">
/**
 * FolderBrowserModal — 目录选择弹窗（面包屑 + 列表版本）
 *
 * 目录数据与导航逻辑见 useFolderBrowser（父组件持有）；本组件负责弹窗编排与
 * 确认/关闭动作。弹窗每次打开都从根目录重新开始，避免残留上次的浏览位置。
 */
import { ref, watch } from 'vue'
import { NButton, NIcon, NModal, NTag } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'
import { useFolderBrowser } from '@/shared/composables/useFolderBrowser'
import type { DirectoryEntry, StorageLocator } from '@/shared/types/common'
import FolderBrowserPanel from '@/shared/components/business/FolderBrowserPanel.vue'

const props = defineProps<{
  show: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', path: string): void
  (e: 'confirmLocator', locator: StorageLocator): void
}>()

const filter = ref('')
const selectedPath = ref('')

const {
  loading,
  currentPath,
  parentPath,
  currentProvider,
  currentFileId,
  enterDirectory,
  goUp,
  buildLocator,
  reset,
  directories,
  providerTag,
  loadDirectory,
} = useFolderBrowser({
  onError: (error: unknown) => {
    console.error('加载目录失败:', error)
  },
  onLoaded: (response) => {
    selectedPath.value = response.current_path
  },
})

/** 面包屑跳转：根与 115 根层级有特殊约定，其余按当前 provider 原样加载 */
function goToPath(path: string) {
  if (path === '') {
    loadDirectory('', 'local', null)
    return
  }
  if (path === '/115网盘') {
    loadDirectory('/115网盘', '115', '0')
    return
  }
  loadDirectory(path, currentProvider.value, currentFileId.value)
}

function handleClose() {
  emit('update:show', false)
}

function handleConfirm() {
  if (!selectedPath.value) return
  emit('confirm', selectedPath.value)
  emit('confirmLocator', buildLocator())
  handleClose()
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      filter.value = ''
      reset('')
    }
  },
)
</script>

<template>
  <NModal
    :show="show"
    :mask-closable="false"
    transform-origin="center"
    @update:show="emit('update:show', $event)"
  >
    <div class="picker" role="dialog" aria-modal="true" :aria-label="title || '选择文件夹'">
      <header class="picker-head">
        <h2 class="picker-title">{{ title || '选择文件夹' }}</h2>
        <NTag size="small" :type="providerTag.type" :bordered="false">{{ providerTag.label }}</NTag>
        <button type="button" class="icon-btn" aria-label="关闭" @click="handleClose">
          <NIcon :component="CloseOutline" :size="17" />
        </button>
      </header>

      <div class="picker-body">
        <FolderBrowserPanel
          v-model:filter="filter"
          :loading="loading"
          :current-path="currentPath"
          :parent-path="parentPath"
          :current-provider="currentProvider"
          :directories="directories"
          :selected-path="selectedPath"
          @navigate="goToPath"
          @up="goUp"
          @enter="(entry: DirectoryEntry) => enterDirectory(entry)"
        />
      </div>

      <footer class="picker-foot">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" :disabled="!selectedPath" @click="handleConfirm">
          确认选择
        </NButton>
      </footer>
    </div>
  </NModal>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  width: 560px;
  max-width: 95vw;
  max-height: 90vh;
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  /* 弹窗是最高层级浮层，用最深一档阴影建立明确的前后关系 */
  box-shadow: var(--shadow-xl);
}

.picker-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-1);
}

.picker-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-left: auto;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-in-out),
    color var(--duration-fast) var(--ease-in-out);
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}

.picker-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
}

.picker-foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-1);
}

/* 移动端：铺满全屏，避免小屏弹窗里再套一层滚动区 */
@media (max-width: 640px) {
  .picker {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
