<script setup lang="ts">
/**
 * 手动任务弹窗页脚（高级设置入口 + 取消/创建）
 *
 * 高级设置按钮上的圆点标记仅在 advancedSettings 非空时出现（原实现如此）。
 */
import { NButton, NIcon, NSpace } from 'naive-ui'
import { SettingsOutline } from '@vicons/ionicons5'

defineProps<{
  /** 是否已设置高级设置（显示圆点标记） */
  hasAdvancedSettings: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  openAdvanced: []
  close: []
  submit: []
}>()
</script>

<template>
  <div class="modal-footer">
    <NButton quaternary @click="emit('openAdvanced')">
      <template #icon>
        <NIcon :component="SettingsOutline" />
      </template>
      高级设置
      <span v-if="hasAdvancedSettings" class="advanced-dot"></span>
    </NButton>
    <NSpace>
      <NButton @click="emit('close')">取消</NButton>
      <NButton type="primary" :loading="submitting" @click="emit('submit')">
        创建任务
      </NButton>
    </NSpace>
  </div>
</template>

<style scoped>
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.advanced-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-500);
  margin-left: 6px;
}
</style>