<script setup lang="ts">
/**
 * 115 网盘（登录状态 + 账号卡 + 扫码登录 / 退出）
 *
 * 版式：SettingsSection 里交给 Cloud115AccountCard 渲染身份/容量/登录信息，
 * 本组件只管「状态从哪来、按钮点了做什么、失败怎么显示」。
 *
 * 登录态探测：账号详情接口会实际打 115，`is_session_valid=false` 即 cookie 已失效，
 * 此时提示重新登录 —— 在此之前只有「浏览 115 报错」才会暴露失效。
 * 二维码流程见 Cloud115QrModal。
 */
import { computed, onMounted, ref } from 'vue'
import { NButton, NSelect } from 'naive-ui'
import { configApi } from '@/shared/api/config'
import type {
  Cloud115AccountInfo,
  Cloud115DeviceOption,
  Cloud115QrSession,
  Cloud115Status,
} from '@/shared/types/common'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import Cloud115AccountCard from '@/modules/settings/components/Cloud115AccountCard.vue'
import Cloud115QrModal from '@/modules/settings/components/Cloud115QrModal.vue'
import { describeError } from '@/modules/settings/hooks/useSettingsForm'

const loading = ref(false)
const starting = ref(false)
const loggingOut = ref(false)
const loadError = ref('')
const actionError = ref('')

const status = ref<Cloud115Status | null>(null)
const account = ref<Cloud115AccountInfo | null>(null)
const accountLoading = ref(false)
const accountError = ref('')
const devices = ref<Cloud115DeviceOption[]>([])
const selectedApp = ref('alipaymini')
const qrSession = ref<Cloud115QrSession | null>(null)

/** 设备下拉选项：后端只返回可用的标准端，顺序即白名单顺序 */
const deviceOptions = computed(() => devices.value.map((d) => ({ label: d.label, value: d.value })))

/** 账号接口拿不到设备名时的兜底：本地保存的设备端标签 */
const currentDeviceLabel = computed(() => {
  if (!status.value) return ''
  const match = devices.value.find((d) => d.value === status.value!.app)
  return match?.label || status.value.app
})

const isSessionInvalid = computed(
  () => status.value?.is_logged_in === true && account.value?.is_session_valid === false,
)

/** 非阻塞提示：登录已失效优先，其次是账号信息读取失败 */
const notice = computed(() => {
  if (isSessionInvalid.value) {
    return account.value?.message || '115 登录已失效，请重新扫码登录'
  }
  return accountError.value
})

const loadAccount = async () => {
  accountLoading.value = true
  accountError.value = ''
  try {
    account.value = await configApi.get115Account()
  } catch (error) {
    account.value = null
    accountError.value = describeError(error, '115 账号信息读取失败')
    console.error('加载 115 账号信息失败:', error)
  } finally {
    accountLoading.value = false
  }
}

const loadPanel = async () => {
  loading.value = true
  loadError.value = ''
  accountError.value = ''
  try {
    status.value = await configApi.get115Status()
    if (status.value.app) selectedApp.value = status.value.app
  } catch (error) {
    loadError.value = describeError(error, '115 状态读取失败')
    console.error('加载 115 状态失败:', error)
    return
  } finally {
    loading.value = false
  }
  if (status.value?.is_logged_in) await loadAccount()
}

const loadDevices = async () => {
  try {
    devices.value = await configApi.get115Devices()
  } catch (error) {
    // 设备列表拉不到不影响查看登录状态，降级为无选项
    console.error('加载 115 设备列表失败:', error)
  }
}

const startQrLogin = async () => {
  if (starting.value) return
  starting.value = true
  actionError.value = ''
  try {
    qrSession.value = await configApi.start115QrLogin(selectedApp.value)
  } catch (error) {
    actionError.value = describeError(error, '生成二维码失败')
  } finally {
    starting.value = false
  }
}

/** 扫码成功：重新读库里的登录状态，再拉一次账号详情 */
const handleQrSuccess = async () => {
  await loadPanel()
}

const clearLogin = async () => {
  if (loggingOut.value) return
  loggingOut.value = true
  actionError.value = ''
  try {
    const result = await configApi.clear115Login()
    account.value = null
    await loadPanel()
    if (!result.success) actionError.value = result.message || '退出失败'
  } catch (error) {
    actionError.value = describeError(error, '退出登录失败')
  } finally {
    loggingOut.value = false
  }
}

onMounted(() => {
  loadPanel()
  loadDevices()
})
</script>

<template>
  <SettingsSection
    title="115 网盘"
    description="登录后可直接在网盘上处理文件，无需先下载到本地"
    :loading="loading"
    :error="loadError"
    :notice="notice"
    :action-error="actionError"
    @retry="loadPanel"
  >
    <!-- 未登录：只需要选设备端 -->
    <SettingsField
      v-if="!status?.is_logged_in"
      label="登录设备"
      hint="选择 115 手机 App 里的设备类型，不同端的登录态互不影响"
      width="lg"
    >
      <NSelect
        v-model:value="selectedApp"
        :options="deviceOptions"
        :loading="loading"
        placeholder="选择登录设备"
      />
    </SettingsField>

    <Cloud115AccountCard
      v-else
      :account="account"
      :loading="accountLoading"
      :fallback-device-label="currentDeviceLabel"
    />

    <template #header-extra>
      <NButton
        v-if="status?.is_logged_in"
        size="small"
        :loading="accountLoading"
        @click="loadAccount"
      >
        刷新
      </NButton>
    </template>

    <template #actions>
      <NButton v-if="!status?.is_logged_in" type="primary" :loading="starting" @click="startQrLogin">
        扫码登录
      </NButton>
      <template v-else>
        <NButton v-if="isSessionInvalid" type="primary" :loading="starting" @click="startQrLogin">
          重新登录
        </NButton>
        <NButton :loading="loggingOut" @click="clearLogin">退出登录</NButton>
      </template>
    </template>
  </SettingsSection>

  <!-- 二维码登录弹窗：session 非空即展示，成功后由本组件刷新状态 -->
  <Cloud115QrModal
    v-model:session="qrSession"
    :restarting="starting"
    @restart="startQrLogin"
    @success="handleQrSuccess"
  />
</template>
