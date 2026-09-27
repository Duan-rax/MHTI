<script setup lang="ts">
/**
 * FolderBrowser — 目录选择弹窗（输入路径 + 面包屑列表）
 *
 * 与 FolderBrowserModal 的关系：对外契约不同（本组件用 v-model + select，
 * 后者用 confirm / confirmLocator），消费方各自依赖其中一种，故保留两个入口；
 * 但主体已统一复用 FolderBrowserPanel，不再各自实现一遍面包屑、目录列表、
 * 空态与"当前选择"条。
 *
 * 115 网盘不支持手输路径，只能逐级导航，故路径输入框在其中替换为只读展示。
 *
 * 必须使用 naive 的 NModal 而不是自绘 Teleport 浮层：naive 的弹窗走内部 z-index
 * 阶梯（2000 起且逐个递增），自绘浮层用 --z-modal(1000) 时会排在所有 naive 弹窗
 * 之下——从创建任务向导里打开本弹窗时会被向导完全盖住（已实际发生）。
 */
import { ref, computed, watch } from 'vue'
import { NButton, NIcon, NInput, NInputGroup, NModal, NTag, useMessage } from 'naive-ui'
import { CloseOutline, RefreshOutline } from '@vicons/ionicons5'
import { useFolderBrowser } from '@/shared/composables/useFolderBrowser'
import type { DirectoryEntry, StorageLocator } from '@/shared/types/common'
import FolderBrowserPanel from '@/shared/components/business/FolderBrowserPanel.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    show?: boolean
    title?: string
  }>(),
  {
    modelValue: '',
    show: false,
    title: '选择文件夹',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:show': [value: boolean]
  select: [path: string]
  selectLocator: [locator: StorageLocator]
}>()

const message = useMessage()
const inputPath = ref('')
const filter = ref('')

const {
  loading,
  currentPath,
  parentPath,
  currentProvider,
  currentFileId,
  enterDirectory,
  goUp,
  refresh,
  buildLocator,
  reset,
  directories,
  providerTag,
  loadDirectory,
} = useFolderBrowser({
  onError: (error: unknown) => {
    const err = error as { response?: { data?: { error?: { message?: string } } } }
    message.error(err?.response?.data?.error?.message || '加载目录失败')
    console.error(error)
  },
  onLoaded: (response) => {
    inputPath.value = response.current_path
  },
})

const selectedPath = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function goToPath() {
  if (currentProvider.value === '115') {
    message.info('115 网盘请通过目录列表导航')
    return
  }
  if (inputPath.value) {
    loadDirectory(inputPath.value, 'local', null)
  }
}

/** 面包屑跳转：空路径回根，其余按当前 provider 原样加载 */
function navigateTo(path: string) {
  if (path === '') {
    loadDirectory('', 'local', null)
    return
  }
  loadDirectory(path, currentProvider.value, currentFileId.value)
}

function selectCurrentPath() {
  selectedPath.value = currentPath.value
  emit('select', currentPath.value)
  emit('selectLocator', buildLocator())
  emit('update:show', false)
}

watch(
  () => props.show,
  (show) => {
    // 每次打开都从根目录重新开始，避免残留上次的浏览位置造成误选
    if (show) {
      filter.value = ''
      reset(props.modelValue || '')
    }
  },
  { immediate: true },
)
</script>

<template>
  <NModal
    :show="show"
    :mask-closable="false"
    transform-origin="center"
    @update:show="emit('update:show', $event)"
  >
    <div class="dialog" role="dialog" aria-modal="true" :aria-label="title">
      <header class="dialog-head">
        <h2 class="dialog-title">{{ title }}</h2>
        <NTag size="small" :type="providerTag.type" :bordered="false">
          {{ providerTag.label }}
        </NTag>
        <button
          type="button"
          class="icon-btn push-right"
          aria-label="刷新目录"
          :disabled="loading"
          @click="refresh"
        >
          <NIcon :component="RefreshOutline" :size="16" />
        </button>
        <button
          type="button"
          class="icon-btn"
          aria-label="关闭"
          @click="emit('update:show', false)"
        >
          <NIcon :component="CloseOutline" :size="17" />
        </button>
      </header>

      <div class="dialog-body">
        <NInputGroup v-if="currentProvider === 'local'">
          <NInput
            v-model:value="inputPath"
            :input-props="{ 'aria-label': '直接跳转到路径' }"
            placeholder="输入绝对路径后跳转"
            @keyup.enter="goToPath"
          />
          <NButton @click="goToPath">跳转</NButton>
        </NInputGroup>
        <NInput
          v-else
          :value="currentPath"
          readonly
          :input-props="{ 'aria-label': '当前网盘路径' }"
        />

        <FolderBrowserPanel
          v-model:filter="filter"
          :loading="loading"
          :current-path="currentPath"
          :parent-path="parentPath"
          :current-provider="currentProvider"
          :directories="directories"
          :selected-path="currentPath"
          @navigate="navigateTo"
          @up="goUp"
          @enter="(entry: DirectoryEntry) => enterDirectory(entry)"
        />
      </div>

      <footer class="dialog-foot">
        <NButton @click="emit('update:show', false)">取消</NButton>
        <NButton type="primary" :disabled="!currentPath" @click="selectCurrentPath">
          选择此文件夹
        </NButton>
      </footer>
    </div>
  </NModal>
</template>

<style scoped>
.dialog {
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

.dialog-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-1);
}

.dialog-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-in-out),
    color var(--duration-fast) var(--ease-in-out);
}

.icon-btn.push-right {
  margin-left: auto;
}

.icon-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-1);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.dialog-body {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  overflow-y: auto;
}

.dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-1);
}

/* 移动端改为近全屏，减少小屏上的滚动与误触 */
@media (max-width: 640px) {
  .dialog {
    width: 100vw;
    max-width: 100vw;
    height: 88vh;
    max-height: 88vh;
    border-radius: var(--radius-lg);
  }
}
</style>
