<script setup lang="ts">
/**
 * 元数据语言配置（主语言 + 回退语言）
 *
 * 状态经 useSettingsForm：加载失败在卡片里给原因与「重试」，不再只 console.error；
 * 保存失败落在操作区上方的错误条里，保留用户已选的项。
 */
import { onMounted, ref } from 'vue'
import { NButton, NSelect } from 'naive-ui'
import { configApi } from '@/shared/api/config'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import { useSettingsForm } from '@/modules/settings/hooks/useSettingsForm'

const primary = ref('zh-CN')
const fallback = ref<string[]>(['en-US'])
const supported = ref<{ label: string; value: string }[]>([])

const load = async () => {
  const config = await configApi.getLanguageConfig()
  primary.value = config.primary
  fallback.value = config.fallback
  supported.value = config.supported.map(([code, name]) => ({
    label: `${name} (${code})`,
    value: code,
  }))
}

const save = async () => {
  await configApi.saveLanguageConfig({ primary: primary.value, fallback: fallback.value })
}

const { loading, saving, loadError, saveError, reload, submit } = useSettingsForm({
  load,
  save,
  successText: '语言配置已保存',
})

onMounted(reload)
</script>

<template>
  <SettingsSection
    title="元数据语言"
    description="决定剧集标题与简介取哪种语言"
    :loading="loading"
    :error="loadError"
    :action-error="saveError"
    @retry="reload"
  >
    <SettingsField label="主语言" hint="优先使用该语言的标题与简介" width="md">
      <NSelect v-model:value="primary" :options="supported" placeholder="选择主语言" />
    </SettingsField>

    <SettingsField label="回退语言" hint="主语言缺数据时按顺序回退" width="lg">
      <NSelect
        v-model:value="fallback"
        :options="supported"
        multiple
        placeholder="选择回退语言"
      />
    </SettingsField>

    <template #actions>
      <NButton type="primary" :loading="saving" @click="submit">保存配置</NButton>
    </template>
  </SettingsSection>
</template>
