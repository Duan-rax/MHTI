<script setup lang="ts">
/**
 * Emby 冲突面板（步骤1：选择处理方式）
 *
 * 步骤2 的季/集选择由父组件用 SeasonEpisodePicker 渲染（与另两处共用），
 * 故本组件只覆盖步骤1（冲突提示 + 三选项）。
 * 纯展示：embyAction 与加载态由父组件持有。
 */
import { NSpin, NTag } from 'naive-ui'
import ConflictOptionGroup, { type ConflictOption } from '@/modules/history/components/ConflictOptionGroup.vue'

defineProps<{
  message: string | null
  season: number | null
  episode: number | null
  modelValue: string
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** "更改季/集"项触发（进入步骤2） */
  change: []
}>()

const options: ConflictOption[] = [
  { value: 'force', label: '强制继续', desc: '忽略 Emby 冲突，继续刮削当前季/集' },
  { value: 'change', label: '更改季/集', desc: '选择其他季/集进行刮削', arrow: true },
  { value: 'skip', label: '跳过', desc: '不刮削该文件' },
]

const handleAction = (value: string) => {
  if (value === 'change') emit('change')
}
</script>

<template>
  <div class="emby-conflict">
    <div class="conflict-message">
      <NTag type="warning" size="small">Emby 已存在</NTag>
      <span>{{ message || `S${season?.toString().padStart(2, '0')}E${episode?.toString().padStart(2, '0')}` }}</span>
    </div>

    <div class="conflict-options">
      <div class="option-title">选择处理方式</div>
      <NSpin :show="loading">
        <ConflictOptionGroup
          :model-value="modelValue"
          :options="options"
          variant="manual"
          @update:model-value="emit('update:modelValue', $event)"
          @action="handleAction"
        />
      </NSpin>
    </div>
  </div>
</template>

<style scoped>
.emby-conflict {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conflict-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgb(var(--warning-rgb) / 10%);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-1);
}

.conflict-options {
  margin-top: 8px;
}

.option-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--text-2);
}
</style>