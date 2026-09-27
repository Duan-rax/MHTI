<script setup lang="ts">
/**
 * TMDB 配置向导 - 步骤 2（粘贴并验证 Token）
 *
 * 纯展示：输入值与验证态由父组件持有（token 经 v-model 透传）。
 * .intro-* 与 .tip-alert 在本组件内各留一份（与 TokenGuideStep 同名类）。
 */
import { NAlert, NIcon, NInput, NSpin } from 'naive-ui'
import { AlertCircleOutline, CheckmarkCircleOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'

defineProps<{
  modelValue: string
  verifying: boolean
  verifyResult: { success: boolean; message: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="step-content">
    <div class="intro-section">
      <NIcon
        :component="ShieldCheckmarkOutline"
        :size="32"
        color="var(--success-500)"
        class="intro-icon"
      />
      <h3 class="intro-title">粘贴并验证 Token</h3>
      <p class="intro-desc">
        请将复制的 API Read Access Token 粘贴到下方输入框
      </p>
    </div>

    <div class="token-input-section">
      <NInput
        :value="modelValue"
        type="textarea"
        placeholder="粘贴 TMDB API Read Access Token (以 eyJ 开头)..."
        :rows="4"
        :disabled="verifying"
        class="token-input"
        @update:value="emit('update:modelValue', $event)"
      />

      <!-- 验证状态 -->
      <div v-if="verifying" class="verify-status">
        <NSpin size="small" />
        <span>正在验证 Token...</span>
      </div>

      <NAlert
        v-else-if="verifyResult"
        :type="verifyResult.success ? 'success' : 'error'"
        class="verify-result"
      >
        <template #icon>
          <NIcon :component="verifyResult.success ? CheckmarkCircleOutline : AlertCircleOutline" />
        </template>
        {{ verifyResult.message }}
      </NAlert>
    </div>

    <NAlert type="warning" class="tip-alert">
      <strong>注意：</strong>Token 将被安全加密存储在本地，不会上传到任何第三方服务。
    </NAlert>
  </div>
</template>

<style scoped>
/* 入场动画是项目禁项：步骤内容直接渲染 */

/* 介绍区域：图标不再包彩色底块，窄间距由 .step-content 的 gap 统一给 */
.intro-section {
  text-align: center;
}

.intro-icon {
  display: inline-block;
  margin-bottom: var(--space-3);
}

.intro-title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.intro-desc {
  margin: 0;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

/* Token 输入区域 */
.token-input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.token-input :deep(.n-input__textarea-el) {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.verify-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-2);
}

.tip-alert :deep(.n-alert__content) {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}
</style>