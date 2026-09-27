<script setup lang="ts">
/**
 * 命名模板配置（三段模板 + 变量表 + 实时预览）
 *
 * 三个模板都用 SettingsField（标签 + 输入 + 预览写成 hint），预览从「NText depth=3 +
 * 内联 12px」改成等宽小字提示行，与其它面板的说明文字同一套字号与颜色。
 * 「可用变量」用朴素的两列表格（变量名 + 说明），不再用带边框的 NDescriptions ——
 * 它在这里只是查表，不是需要强调的表单信息。
 */
import { onMounted, ref, watch } from 'vue'
import { NButton, NInput } from 'naive-ui'
import { configApi } from '@/shared/api/config'
import type { NamingTemplate } from '@/shared/types/common'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import SettingsGroup from '@/modules/settings/components/SettingsGroup.vue'
import { useSettingsForm } from '@/modules/settings/hooks/useSettingsForm'

const template = ref<NamingTemplate>({
  series_folder: '{title}',
  season_folder: 'Season {season}',
  episode_file: '{title} - S{season:02d}E{episode:02d} - {episode_title}',
})
const previews = ref({
  series_folder: '',
  season_folder: '',
  episode_file: '',
})

/** 模板变量表：查用途用，键为模板占位符 */
const VARIABLES = [
  { name: '{title}', desc: '剧集名称' },
  { name: '{original_title}', desc: '原始标题' },
  { name: '{year}', desc: '首播年份' },
  { name: '{season}', desc: '季编号' },
  { name: '{episode}', desc: '集编号' },
  { name: '{episode_title}', desc: '集标题' },
]

const SAMPLE = {
  title: '权力的游戏',
  original_title: 'Game of Thrones',
  year: 2011,
  season: 1,
  episode: 1,
  episode_title: '凛冬将至',
  air_date: '2011-04-17',
}

const updatePreviews = async () => {
  try {
    const [seriesRes, seasonRes, episodeRes] = await Promise.all([
      configApi.previewTemplate(template.value.series_folder, SAMPLE),
      configApi.previewTemplate(template.value.season_folder, SAMPLE),
      configApi.previewTemplate(template.value.episode_file, SAMPLE),
    ])
    previews.value = {
      series_folder: seriesRes.preview,
      season_folder: seasonRes.preview,
      episode_file: episodeRes.preview,
    }
  } catch (error) {
    // 预览失败不影响编辑模板本身，只留控制台
    console.error(error)
  }
}

const load = async () => {
  template.value = await configApi.getNamingConfig()
  await updatePreviews()
}

const save = async () => {
  await configApi.saveNamingConfig(template.value)
  await updatePreviews()
}

const { loading, saving, loadError, saveError, reload, submit } = useSettingsForm({
  load,
  save,
  successText: '命名模板已保存',
})

/** 恢复默认模板：只填进表单，仍需用户点保存才生效（保持原行为） */
const resetToDefault = async () => {
  try {
    template.value = await configApi.getDefaultTemplate()
    await updatePreviews()
  } catch (error) {
    console.error(error)
  }
}

// 防抖更新预览
let debounceTimer: ReturnType<typeof setTimeout>
watch(
  template,
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(updatePreviews, 500)
  },
  { deep: true },
)

onMounted(reload)
</script>

<template>
  <SettingsSection
    title="命名模板"
    description="决定整理后的目录名与文件名，改动会影响后续所有任务"
    :loading="loading"
    :error="loadError"
    :action-error="saveError"
    @retry="reload"
  >
    <SettingsField
      label="剧集文件夹"
      :hint="`预览：${previews.series_folder || '—'}`"
      width="full"
    >
      <NInput v-model:value="template.series_folder" placeholder="{title}" />
    </SettingsField>

    <SettingsField
      label="季文件夹"
      :hint="`预览：${previews.season_folder || '—'}`"
      width="full"
    >
      <NInput v-model:value="template.season_folder" placeholder="Season {season}" />
    </SettingsField>

    <SettingsField
      label="集文件"
      :hint="`预览：${previews.episode_file || '—'}`"
      width="full"
    >
      <NInput
        v-model:value="template.episode_file"
        placeholder="{title} - S{season:02d}E{episode:02d}"
      />
    </SettingsField>

    <SettingsGroup title="可用变量">
      <dl class="variable-list">
        <div v-for="item in VARIABLES" :key="item.name" class="variable-row">
          <dt class="variable-name">{{ item.name }}</dt>
          <dd class="variable-desc">{{ item.desc }}</dd>
        </div>
      </dl>
    </SettingsGroup>

    <template #actions>
      <NButton type="primary" :loading="saving" @click="submit">保存配置</NButton>
      <NButton :disabled="loading || saving" @click="resetToDefault">恢复默认模板</NButton>
    </template>
  </SettingsSection>
</template>

<style scoped>
.variable-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2) var(--space-6);
  margin: 0;
}

.variable-row {
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  gap: var(--space-3);
  align-items: baseline;
}

.variable-name {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-1);
}

.variable-desc {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-2);
}

@media (max-width: 767px) {
  .variable-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
