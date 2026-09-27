<script setup lang="ts">
/**
 * TMDB 配置向导页脚
 *
 * 步骤指示 + 上一步/下一步。按钮文案与禁用条件逐字保留
 * （「验证并继续」仅步骤 2；canProceed 由父组件计算后传入）。
 */
import { NButton, NIcon, NSpace } from 'naive-ui'
import { ArrowBackOutline, ArrowForwardOutline } from '@vicons/ionicons5'

defineProps<{
  currentStep: number
  canProceed: boolean
  verifying: boolean
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <div class="wizard-footer">
    <div class="footer-left">
      <span class="step-indicator">步骤 {{ currentStep }} / 3</span>
    </div>
    <NSpace>
      <NButton v-if="currentStep > 1" @click="emit('prev')">
        <template #icon>
          <NIcon :component="ArrowBackOutline" />
        </template>
        上一步
      </NButton>
      <NButton
        type="primary"
        :disabled="!canProceed"
        :loading="verifying"
        @click="emit('next')"
      >
        {{ currentStep === 2 ? '验证并继续' : '下一步' }}
        <template #icon>
          <NIcon :component="ArrowForwardOutline" />
        </template>
      </NButton>
    </NSpace>
  </div>
</template>

<style scoped>
/* 底部操作 */
.wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-2);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.step-indicator {
  font-size: var(--text-sm);
  color: var(--text-2);
}
</style>