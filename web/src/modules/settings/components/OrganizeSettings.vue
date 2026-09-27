<script setup lang="ts">
/**
 * 整理配置（目录 / 模式 / 过滤规则 / 源文件清理）
 *
 * 版式改由 SettingsSection + SettingsField 承担：
 * - 内联 `style="margin-left: 8px; color: var(--text-3)"` 的说明文字全部改为字段 hint
 *   （常驻、12px、--text-2，符合对比度要求）；
 * - 目录行的「输入框 + 选择按钮」宽度由字段档位（full）决定，不再靠内联宽度；
 * - 选择按钮从纯图标改为「图标 + 文字」，避免出现无名称的图标按钮。
 */
import { onMounted, ref } from 'vue'
import { NButton, NIcon, NDynamicTags, NInput, NInputNumber, NSelect, NSwitch } from 'naive-ui'
import { FolderOutline } from '@vicons/ionicons5'
import { configApi } from '@/shared/api/config'
import type { OrganizeMode } from '@/shared/types/common'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import FolderBrowserModal from '@/shared/components/business/FolderBrowserModal.vue'
import { useSettingsForm } from '@/modules/settings/hooks/useSettingsForm'

const organizeDir = ref('')
const metadataDir = ref('')
const organizeMode = ref<OrganizeMode>('copy')
const minFileSizeMb = ref(100)
const fileTypeWhitelist = ref<string[]>(['mkv', 'mp4', 'avi', 'wmv', 'ts', 'rmvb'])
const filenameBlacklist = ref<string[]>(['sample', 'trailer'])
const junkPatternFilter = ref<string[]>([])
const autoCleanSource = ref(false)

const showOrganizeDirBrowser = ref(false)
const showMetadataDirBrowser = ref(false)

const modeOptions = [
  { label: '复制', value: 'copy' },
  { label: '移动', value: 'move' },
  { label: '硬链接', value: 'hardlink' },
  { label: '软链接', value: 'symlink' },
]

const load = async () => {
  const config = await configApi.getOrganizeConfig()
  organizeDir.value = config.organize_dir
  metadataDir.value = config.metadata_dir
  organizeMode.value = config.organize_mode
  minFileSizeMb.value = config.min_file_size_mb
  fileTypeWhitelist.value = config.file_type_whitelist
  filenameBlacklist.value = config.filename_blacklist
  junkPatternFilter.value = config.junk_pattern_filter
  autoCleanSource.value = config.auto_clean_source
}

const save = async () => {
  await configApi.saveOrganizeConfig({
    organize_dir: organizeDir.value,
    metadata_dir: metadataDir.value,
    organize_mode: organizeMode.value,
    min_file_size_mb: minFileSizeMb.value,
    file_type_whitelist: fileTypeWhitelist.value,
    filename_blacklist: filenameBlacklist.value,
    junk_pattern_filter: junkPatternFilter.value,
    auto_clean_source: autoCleanSource.value,
  })
}

const { loading, saving, loadError, saveError, reload, submit } = useSettingsForm({
  load,
  save,
  successText: '整理配置已保存',
})

onMounted(reload)
</script>

<template>
  <SettingsSection
    title="整理配置"
    description="刮削完成后文件放到哪、叫什么名字、哪些文件跳过"
    :loading="loading"
    :error="loadError"
    :action-error="saveError"
    @retry="reload"
  >
    <SettingsField label="整理目录" hint="整理后的文件存放目录" width="full">
      <NInput v-model:value="organizeDir" placeholder="如 D:\\媒体库" />
      <NButton aria-label="选择整理目录" @click="showOrganizeDirBrowser = true">
        <template #icon>
          <NIcon :component="FolderOutline" />
        </template>
        选择
      </NButton>
    </SettingsField>

    <SettingsField
      label="元数据目录"
      hint="NFO 与图片的存放目录，留空则与视频同目录"
      width="full"
    >
      <NInput v-model:value="metadataDir" placeholder="留空则与视频同目录" />
      <NButton aria-label="选择元数据目录" @click="showMetadataDirBrowser = true">
        <template #icon>
          <NIcon :component="FolderOutline" />
        </template>
        选择
      </NButton>
    </SettingsField>

    <SettingsField
      label="整理模式"
      hint="复制最安全；移动省空间；硬链接/软链接需同一磁盘且文件系统支持"
      width="md"
    >
      <NSelect v-model:value="organizeMode" :options="modeOptions" />
    </SettingsField>

    <SettingsField label="文件大小过滤" hint="单位 MB，小于该值的文件视为样本忽略" width="sm">
      <NInputNumber v-model:value="minFileSizeMb" :min="0" :max="10000" />
    </SettingsField>

    <SettingsField label="文件类型白名单" hint="只有这些后缀会被处理" width="full">
      <NDynamicTags v-model:value="fileTypeWhitelist" />
    </SettingsField>

    <SettingsField label="文件名黑名单" hint="文件名含这些词的文件会被跳过" width="full">
      <NDynamicTags v-model:value="filenameBlacklist" />
    </SettingsField>

    <SettingsField label="垃圾信息过滤" hint="支持正则表达式，用于清理文件名中的广告串" width="full">
      <NDynamicTags v-model:value="junkPatternFilter" />
    </SettingsField>

    <SettingsField label="自动清理源目录" hint="整理完成后删除源文件（移动模式下慎用）" width="sm">
      <NSwitch v-model:value="autoCleanSource" />
    </SettingsField>

    <template #actions>
      <NButton type="primary" :loading="saving" @click="submit">保存配置</NButton>
    </template>
  </SettingsSection>

  <!-- 整理目录选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showOrganizeDirBrowser"
    title="选择整理目录"
    @confirm="organizeDir = $event"
  />

  <!-- 元数据目录选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showMetadataDirBrowser"
    title="选择元数据目录"
    @confirm="metadataDir = $event"
  />
</template>
