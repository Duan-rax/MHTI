<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal,
  NCard,
  NSteps,
  NStep,
  NButton,
  NIcon,
  useMessage,
} from 'naive-ui'
import {
  CloseOutline,
  KeyOutline,
  CheckmarkCircleOutline,
  ShieldCheckmarkOutline,
} from '@vicons/ionicons5'
import { configApi } from '@/shared/api/config'
import type { ApiTokenStatus } from '@/shared/types/common'
import TokenGuideStep from '@/modules/settings/components/tmdb/TokenGuideStep.vue'
import TokenVerifyStep from '@/modules/settings/components/tmdb/TokenVerifyStep.vue'
import SetupCompleteStep from '@/modules/settings/components/tmdb/SetupCompleteStep.vue'
import TmdbWizardFooter from '@/modules/settings/components/tmdb/TmdbWizardFooter.vue'

const props = defineProps<{
  show: boolean
  // 初始状态，用于跳过已完成的步骤
  initialStatus?: ApiTokenStatus | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success'): void
}>()

const message = useMessage()

// 步骤状态
const currentStep = ref(1)
const tokenInput = ref('')
const verifying = ref(false)
const verifyResult = ref<{ success: boolean; message: string } | null>(null)

// 步骤配置
const steps = [
  { title: '获取 Token', icon: KeyOutline },
  { title: '验证配置', icon: ShieldCheckmarkOutline },
  { title: '完成设置', icon: CheckmarkCircleOutline },
]

// 是否可以继续下一步
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return true // 步骤1总是可以继续
  }
  if (currentStep.value === 2) {
    return tokenInput.value.trim().length > 0
  }
  return true
})

// 重置状态
const resetState = () => {
  currentStep.value = 1
  tokenInput.value = ''
  verifyResult.value = null
  verifying.value = false
}

// 关闭弹窗
const handleClose = () => {
  emit('update:show', false)
  // 延迟重置，避免动画问题
  setTimeout(resetState, 300)
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    verifyResult.value = null
  }
}

// 下一步
const nextStep = async () => {
  if (currentStep.value === 2) {
    // 验证 Token
    await verifyToken()
  } else if (currentStep.value < 3) {
    currentStep.value++
  }
}

// 验证 Token
const verifyToken = async () => {
  if (!tokenInput.value.trim()) {
    message.warning('请输入 API Token')
    return
  }

  verifying.value = true
  verifyResult.value = null

  try {
    const response = await configApi.saveApiToken(tokenInput.value.trim())
    if (response.success && response.status?.is_valid) {
      verifyResult.value = { success: true, message: 'Token 验证成功！' }
      // 自动进入下一步
      setTimeout(() => {
        currentStep.value = 3
      }, 800)
    } else {
      verifyResult.value = {
        success: false,
        message: response.message || 'Token 验证失败，请检查是否正确',
      }
    }
  } catch (error) {
    verifyResult.value = {
      success: false,
      message: '验证过程中出错，请稍后重试',
    }
    console.error(error)
  } finally {
    verifying.value = false
  }
}

// 打开外部链接
const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// 完成设置
const handleComplete = () => {
  emit('success')
  handleClose()
}

// 监听显示状态
watch(() => props.show, (show) => {
  if (show) {
    // 如果已配置，直接跳到验证步骤
    if (props.initialStatus?.is_configured && props.initialStatus?.is_valid) {
      currentStep.value = 3
    } else {
      resetState()
    }
  }
})
</script>

<template>
  <NModal
    :show="show"
    :mask-closable="false"
    transform-origin="center"
    @update:show="emit('update:show', $event)"
  >
    <NCard class="wizard-modal" :bordered="false">
      <!-- 头部 -->
      <template #header>
        <div class="wizard-header">
          <span class="wizard-title">配置 TMDB API</span>
          <NButton quaternary circle size="small" @click="handleClose" aria-label="关闭">
            <template #icon>
              <NIcon :component="CloseOutline" />
            </template>
          </NButton>
        </div>
      </template>

      <!-- 步骤指示器 -->
      <div class="wizard-steps">
        <NSteps :current="currentStep" size="small">
          <NStep
            v-for="(step, index) in steps"
            :key="index"
            :title="step.title"
          />
        </NSteps>
      </div>

      <!-- 步骤内容 -->
      <div class="wizard-content">
        <!-- 步骤 1: 获取 Token -->
        <TokenGuideStep v-if="currentStep === 1" @open="openExternal" />

        <!-- 步骤 2: 验证配置 -->
        <TokenVerifyStep
          v-else-if="currentStep === 2"
          v-model="tokenInput"
          :verifying="verifying"
          :verify-result="verifyResult"
        />

        <!-- 步骤 3: 完成设置 -->
        <SetupCompleteStep v-else @complete="handleComplete" />
      </div>

      <!-- 底部操作 -->
      <template v-if="currentStep < 3" #footer>
        <TmdbWizardFooter
          :current-step="currentStep"
          :can-proceed="canProceed"
          :verifying="verifying"
          @prev="prevStep"
          @next="nextStep"
        />
      </template>
    </NCard>
  </NModal>
</template>

<style scoped>
.wizard-modal {
  /* 宽度是布局常量（弹窗尺寸），其余全部走令牌 */
  width: 560px;
  max-width: 95vw;
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  /* 浮层阴影只用令牌档位；原先写死的 0 25px 80px black/20% 属自造阴影 */
  box-shadow: var(--shadow-xl);
}

.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wizard-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.wizard-steps {
  padding: 0 var(--space-2) var(--space-5);
  border-bottom: 1px solid var(--border-1);
  margin-bottom: var(--space-5);
}

.wizard-content {
  /* 固定最小高度：三步内容高度不同，不固定会让弹窗在切步时跳动 */
  min-height: 380px;
  padding: 0 var(--space-2);
}

/* 主按钮不再叠发光投影（发光描边属禁项），只用主题自带状态色 */
.wizard-modal :deep(.n-result) {
  padding: var(--space-5) 0;
}

.wizard-modal :deep(.n-result__header) {
  padding: 0;
}

.wizard-modal :deep(.n-result__icon) {
  margin-bottom: var(--space-4);
}
</style>