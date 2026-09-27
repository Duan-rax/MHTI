<script setup lang="ts">
import { computed } from 'vue'
import {
  NFormItem,
  NInput,
  NInputGroup,
  NButton,
  NIcon,
  NSelect,
  NTooltip,
  NAlert,
} from 'naive-ui'
import {
  FolderOpenOutline,
  InformationCircleOutline,
} from '@vicons/ionicons5'
import type { OrganizeConfig, StorageLocator, WatchedFolder } from '@/shared/types/common'
import FolderBrowser from '@/shared/components/business/FolderBrowser.vue'
import { ref } from 'vue'

const props = defineProps<{
  scanPath: string
  targetFolder: string
  metadataDir: string
  scanLocator: StorageLocator | null
  targetLocator: StorageLocator | null
  metadataLocator: StorageLocator | null
  watchedFolders: WatchedFolder[]
  globalConfig: OrganizeConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:scanPath', value: string): void
  (e: 'update:targetFolder', value: string): void
  (e: 'update:metadataDir', value: string): void
  (e: 'update:scanLocator', value: StorageLocator | null): void
  (e: 'update:targetLocator', value: StorageLocator | null): void
  (e: 'update:metadataLocator', value: StorageLocator | null): void
}>()

// 文件夹浏览器状态
const showBrowser = ref(false)
const browserMode = ref<'scan' | 'target' | 'metadata'>('scan')

// 监控目录选项
const watchedFolderOptions = computed(() => {
  return props.watchedFolders.map(folder => ({
    label: folder.path,
    value: folder.path,
  }))
})

// 打开文件夹浏览器
const openBrowser = (mode: 'scan' | 'target' | 'metadata') => {
  browserMode.value = mode
  showBrowser.value = true
}

// 选择文件夹
const handleFolderSelect = (path: string) => {
  if (browserMode.value === 'scan') {
    emit('update:scanPath', path)
  } else if (browserMode.value === 'target') {
    emit('update:targetFolder', path)
  } else {
    emit('update:metadataDir', path)
  }
  showBrowser.value = false
}

// 接收文件夹选择器的 locator（115 等云端目录）
const handleFolderLocator = (locator: StorageLocator) => {
  if (browserMode.value === 'scan') {
    emit('update:scanLocator', locator)
  } else if (browserMode.value === 'target') {
    emit('update:targetLocator', locator)
  } else {
    emit('update:metadataLocator', locator)
  }
}

// 从监控目录快速填充
const handleWatchedFolderSelect = (path: string) => {
  emit('update:scanPath', path)
  const folder = props.watchedFolders.find(f => f.path === path)
  if (folder?.output_dir) {
    emit('update:targetFolder', folder.output_dir)
  }
}

// 使用全局配置的整理目录
const useGlobalTargetFolder = () => {
  if (props.globalConfig?.organize_dir) {
    emit('update:targetFolder', props.globalConfig.organize_dir)
  }
}
</script>

<template>
  <div class="path-select-step">
    <NAlert type="info" :bordered="false" :show-icon="false" class="step-tip">
      <span class="tip-content">
        <NIcon :component="InformationCircleOutline" :size="16" aria-hidden="true" />
        <span>选择要刮削的文件夹和整理后的目标位置</span>
      </span>
    </NAlert>

    <!-- 刮削路径 -->
    <NFormItem label="刮削路径" required>
      <div class="path-input-group">
        <NInputGroup>
          <NInput
            :value="scanPath"
            placeholder="输入或选择要刮削的文件夹路径"
            @update:value="emit('update:scanPath', $event)"
          />
          <NButton @click="openBrowser('scan')" aria-label="选择刮削路径">
            <template #icon>
              <NIcon :component="FolderOpenOutline" />
            </template>
          </NButton>
        </NInputGroup>
        <NSelect
          v-if="watchedFolderOptions.length > 0"
          :value="null"
          :options="watchedFolderOptions"
          placeholder="从监控目录选择"
          clearable
          style="margin-top: 8px"
          @update:value="handleWatchedFolderSelect"
        />
      </div>
    </NFormItem>

    <!-- 整理目录 -->
    <NFormItem label="整理目录" required>
      <div class="path-input-group">
        <NInputGroup>
          <NInput
            :value="targetFolder"
            placeholder="输入或选择整理后的目标文件夹"
            @update:value="emit('update:targetFolder', $event)"
          />
          <NButton @click="openBrowser('target')" aria-label="选择整理目录">
            <template #icon>
              <NIcon :component="FolderOpenOutline" />
            </template>
          </NButton>
        </NInputGroup>
        <div v-if="globalConfig?.organize_dir" class="quick-fill">
          <NButton text size="small" type="primary" @click="useGlobalTargetFolder">
            使用全局配置: {{ globalConfig.organize_dir }}
          </NButton>
        </div>
      </div>
    </NFormItem>

    <!-- 元数据目录（可选） -->
    <NFormItem label="元数据目录">
      <template #label>
        <div class="label-with-tip">
          <span>元数据目录</span>
          <NTooltip>
            <template #trigger>
              <NIcon :component="InformationCircleOutline" class="tip-icon" />
            </template>
            可选。如不填写，元数据将保存在视频文件同目录
          </NTooltip>
        </div>
      </template>
      <NInputGroup>
        <NInput
          :value="metadataDir"
          placeholder="可选，留空则与视频同目录"
          @update:value="emit('update:metadataDir', $event)"
        />
        <NButton @click="openBrowser('metadata')" aria-label="选择元数据目录">
          <template #icon>
            <NIcon :component="FolderOpenOutline" />
          </template>
        </NButton>
      </NInputGroup>
    </NFormItem>

    <!-- 文件夹浏览器 -->
    <FolderBrowser
      v-model:show="showBrowser"
      :title="browserMode === 'scan' ? '选择刮削路径' : browserMode === 'target' ? '选择整理目录' : '选择元数据目录'"
      @select="handleFolderSelect"
      @select-locator="handleFolderLocator"
    />
  </div>
</template>

<style scoped>
.path-select-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/**
 * 提示条：图标自行渲染并与文字同排，不用 NAlert 的 #icon 槽。
 * naive 的 .n-alert__icon 是绝对定位（left:0 + width:--n-icon-size 24px），
 * 文字左内边距由 .n-alert--show-icon .n-alert-body 的 calc 让出；
 * 本文件把 body padding 压到 12/16 后该避让失效，实测图标压住首字 20px。
 */
.step-tip {
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
}

.step-tip :deep(.n-alert-body) {
  padding: var(--space-3) var(--space-4);
}

.tip-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* 图标改用 type 对应的语义色（naive 只给自己的 .n-alert__icon 上色） */
.tip-content :deep(.n-icon) {
  color: var(--n-icon-color);
}

.path-input-group {
  width: 100%;
}

.quick-fill {
  margin-top: 8px;
}

.label-with-tip {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tip-icon {
  font-size: 14px;
  color: var(--text-3);
  cursor: help;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-input) {
  border-radius: 10px;
}

:deep(.n-input-group .n-input) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.n-input-group .n-button) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
