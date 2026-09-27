<script setup lang="ts">
/**
 * 文件工具栏（FilesPage 卡片内工具行）
 *
 * 关键字过滤 + 选中计数 + 创建任务按钮。纯展示：search 经 v-model 透传，
 * 禁用条件与原实现一致（!currentPath）。
 *
 * 两处取舍：
 * - 计数只在真有选中时出现：常驻的「已选中 0 项」占着位置却不传达信息；
 * - 搜索框给显式 aria-label：naive 的 NInput 不转发裸 aria-*，且 placeholder
 *   不能当字段名用（输入后即消失）。
 */
import { NButton, NIcon, NInput } from 'naive-ui'
import { AddOutline, SearchOutline } from '@vicons/ionicons5'

defineProps<{
  modelValue: string
  checkedCount: number
  currentPath: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  create: []
}>()
</script>

<template>
  <div class="file-tools">
    <NInput
      :value="modelValue"
      placeholder="关键字过滤"
      clearable
      class="search-input"
      :input-props="{ 'aria-label': '按名称过滤当前目录' }"
      @update:value="emit('update:modelValue', $event)"
    >
      <template #prefix>
        <NIcon :component="SearchOutline" />
      </template>
    </NInput>

    <div class="tools-actions">
      <span v-if="checkedCount > 0" class="selection tabular">
        已选中 {{ checkedCount }} 项
      </span>
      <NButton type="primary" :disabled="!currentPath" @click="emit('create')">
        <template #icon>
          <NIcon :component="AddOutline" :size="16" />
        </template>
        创建任务
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.file-tools {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.search-input {
  width: 260px;
}

.tools-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.selection {
  font-size: var(--text-sm);
  color: var(--text-2);
}

/* 窄屏：搜索独占一行；操作行右侧永远留给主按钮，计数靠左 */
@media (max-width: 767px) {
  .file-tools {
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
  }

  .tools-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .selection {
    margin-right: auto;
  }
}
</style>
