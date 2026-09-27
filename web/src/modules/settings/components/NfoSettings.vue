<script setup lang="ts">
/**
 * NFO 配置（总开关 + 三类 NFO 的字段勾选）
 *
 * 保持 NFO 折叠面板结构（字段多，折叠比铺开省力），但：
 * 1. 字段勾选从 4 列 NGrid 改成响应式 grid（2/3/4 列），窄屏不再是 4 个挤在 1 行；
 * 2. 禁用提示从内联 style 改成统一的小字说明；
 * 3. 蓝底 NAlert 说明改成常驻说明行。
 */
import { onMounted, reactive } from 'vue'
import { NButton, NCheckbox, NCollapse, NCollapseItem, NSwitch } from 'naive-ui'
import { configApi } from '@/shared/api/config'
import type { NfoConfig } from '@/shared/types/common'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import SettingsGroup from '@/modules/settings/components/SettingsGroup.vue'
import { useSettingsForm } from '@/modules/settings/hooks/useSettingsForm'

const config = reactive<NfoConfig>({
  enabled: true,
  tvshow: {
    enabled: true,
    title: true,
    originaltitle: true,
    sorttitle: true,
    plot: true,
    outline: true,
    year: true,
    premiered: true,
    rating: true,
    genre: true,
    status: true,
    tmdbid: true,
  },
  season: {
    enabled: true,
    title: true,
    plot: true,
    year: true,
    premiered: true,
    seasonnumber: true,
  },
  episode: {
    enabled: true,
    title: true,
    plot: true,
    season: true,
    episode: true,
    aired: true,
    rating: true,
  },
})

const load = async () => {
  const data = await configApi.getNfoConfig()
  Object.assign(config, data)
}

const save = async () => {
  await configApi.saveNfoConfig(config)
}

const { loading, saving, loadError, saveError, reload, submit } = useSettingsForm({
  load,
  save,
  successText: 'NFO 配置已保存',
})

onMounted(reload)
</script>

<template>
  <SettingsSection
    title="NFO 元数据"
    description="NFO 供 Jellyfin / Emby / Kodi 读取剧集元数据"
    :loading="loading"
    :error="loadError"
    :action-error="saveError"
    @retry="reload"
  >
    <SettingsField label="启用 NFO 生成" hint="关闭后不生成任何 NFO 文件" width="sm">
      <NSwitch v-model:value="config.enabled" />
    </SettingsField>

    <template v-if="config.enabled">
      <NCollapse :default-expanded-names="['tvshow', 'season', 'episode']">
        <NCollapseItem title="剧集 NFO" name="tvshow">
          <template #header-extra>
            <NSwitch v-model:value="config.tvshow.enabled" size="small" @click.stop />
          </template>
          <SettingsGroup title="tvshow.nfo 字段">
            <div v-if="config.tvshow.enabled" class="check-grid is-3">
              <NCheckbox v-model:checked="config.tvshow.title">标题 (title)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.originaltitle">
                原标题 (originaltitle)
              </NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.sorttitle">排序标题 (sorttitle)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.plot">简介 (plot)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.outline">摘要 (outline)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.year">年份 (year)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.premiered">首播日期 (premiered)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.rating">评分 (rating)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.genre">类型 (genre)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.status">状态 (status)</NCheckbox>
              <NCheckbox v-model:checked="config.tvshow.tmdbid">TMDB ID (tmdbid)</NCheckbox>
            </div>
            <p v-else class="disabled-note">该文件已禁用，不会生成 tvshow.nfo</p>
          </SettingsGroup>
        </NCollapseItem>

        <NCollapseItem title="季 NFO" name="season">
          <template #header-extra>
            <NSwitch v-model:value="config.season.enabled" size="small" @click.stop />
          </template>
          <SettingsGroup title="season.nfo 字段">
            <div v-if="config.season.enabled" class="check-grid is-3">
              <NCheckbox v-model:checked="config.season.title">标题 (title)</NCheckbox>
              <NCheckbox v-model:checked="config.season.plot">简介 (plot)</NCheckbox>
              <NCheckbox v-model:checked="config.season.year">年份 (year)</NCheckbox>
              <NCheckbox v-model:checked="config.season.premiered">首播日期 (premiered)</NCheckbox>
              <NCheckbox v-model:checked="config.season.seasonnumber">季号 (seasonnumber)</NCheckbox>
            </div>
            <p v-else class="disabled-note">该文件已禁用，不会生成 season.nfo</p>
          </SettingsGroup>
        </NCollapseItem>

        <NCollapseItem title="集 NFO" name="episode">
          <template #header-extra>
            <NSwitch v-model:value="config.episode.enabled" size="small" @click.stop />
          </template>
          <SettingsGroup title="episode.nfo 字段">
            <div v-if="config.episode.enabled" class="check-grid is-3">
              <NCheckbox v-model:checked="config.episode.title">标题 (title)</NCheckbox>
              <NCheckbox v-model:checked="config.episode.plot">简介 (plot)</NCheckbox>
              <NCheckbox v-model:checked="config.episode.season">季号 (season)</NCheckbox>
              <NCheckbox v-model:checked="config.episode.episode">集号 (episode)</NCheckbox>
              <NCheckbox v-model:checked="config.episode.aired">播出日期 (aired)</NCheckbox>
              <NCheckbox v-model:checked="config.episode.rating">评分 (rating)</NCheckbox>
            </div>
            <p v-else class="disabled-note">该文件已禁用，不会生成 episode.nfo</p>
          </SettingsGroup>
        </NCollapseItem>
      </NCollapse>
    </template>

    <template #actions>
      <NButton type="primary" :loading="saving" @click="submit">保存配置</NButton>
    </template>
  </SettingsSection>
</template>

<style scoped>
.check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3) var(--space-4);
}

.disabled-note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-2);
}

@media (min-width: 1024px) {
  .check-grid.is-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

:deep(.n-collapse-item__header-main) {
  font-weight: var(--weight-medium);
}

:deep(.n-collapse-item__content-inner) {
  padding-top: var(--space-3);
}
</style>
