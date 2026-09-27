<script setup lang="ts">
/**
 * 目录监控配置（开关 / 模式 / 性能模式 / 监控目录列表）
 *
 * 版式改由 SettingsSection + SettingsField 承担；两处设计调整：
 * 1. 原来的 NAlert 蓝底提示改成常驻说明文字：它解释的是所选模式的适用场景，
 *    属于字段说明而不是告警，用底色只会让页面到处是色块；
 * 2. 模式选项的括号说明从内联 style 改成 SettingsField 的 hint 与选项内的次级文字，
 *    字号与对比度都跟令牌走。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { NButton, NEmpty, NIcon, NList, NListItem, NRadio, NRadioGroup, NSwitch } from 'naive-ui'
import { AddOutline, FolderOutline, TrashOutline } from '@vicons/ionicons5'
import { configApi } from '@/shared/api/config'
import type { WatcherMode } from '@/shared/types/common'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import FolderBrowserModal from '@/shared/components/business/FolderBrowserModal.vue'
import { useSettingsForm } from '@/modules/settings/hooks/useSettingsForm'

const enabled = ref(false)
const mode = ref<WatcherMode>('realtime')
const performanceMode = ref(false)
const watchDirs = ref<string[]>([])
const showFolderBrowser = ref(false)

/** 是否含 115 网盘目录（决定是否显示事件模式选项） */
const hasP115Dir = computed(() => watchDirs.value.some((dir) => dir.startsWith('/115网盘')))

/** 所选模式的适用场景：常驻说明，取代原先的蓝底 NAlert */
const modeHint = computed(() => {
  if (mode.value === 'compat') {
    return '群晖系统、SMB/NFS 远程挂载、以及监控不工作时使用兼容模式'
  }
  if (mode.value === 'event') {
    return '事件模式通过 115 生活事件 API 拉取操作记录；本地目录会自动使用兼容模式'
  }
  return '实时监听文件系统事件，响应最及时；115 目录不支持实时模式'
})

// 115 目录变化时自动调整模式
watch(hasP115Dir, (val) => {
  if (!val && mode.value === 'event') mode.value = 'compat'
  if (val && mode.value === 'realtime') mode.value = 'compat'
})

const load = async () => {
  const config = await configApi.getWatcherConfig()
  enabled.value = config.enabled
  mode.value = config.mode
  performanceMode.value = config.performance_mode
  watchDirs.value = config.watch_dirs
}

const save = async () => {
  await configApi.saveWatcherConfig({
    enabled: enabled.value,
    mode: mode.value,
    performance_mode: performanceMode.value,
    watch_dirs: watchDirs.value,
  })
}

const { loading, saving, loadError, saveError, reload, submit } = useSettingsForm({
  load,
  save,
  successText: '监控配置已保存',
})

const handleAddDir = (path: string) => {
  if (path && !watchDirs.value.includes(path)) watchDirs.value.push(path)
}

const handleRemoveDir = (index: number) => {
  watchDirs.value.splice(index, 1)
}

onMounted(reload)
</script>

<template>
  <SettingsSection
    title="监控配置"
    description="指定目录出现新文件时自动建刮削任务"
    :loading="loading"
    :error="loadError"
    :action-error="saveError"
    @retry="reload"
  >
    <SettingsField label="启用目录监控" hint="关闭后仅手动创建任务" width="sm">
      <NSwitch v-model:value="enabled" />
    </SettingsField>

    <SettingsField label="监控模式" :hint="modeHint" width="full">
      <NRadioGroup v-model:value="mode">
        <div class="mode-list">
          <NRadio value="realtime" :disabled="hasP115Dir">
            实时模式
            <span class="mode-note">文件系统事件，响应及时</span>
          </NRadio>
          <NRadio value="compat">
            兼容模式
            <span class="mode-note">定时扫描，兼容远程挂载</span>
          </NRadio>
          <NRadio v-if="hasP115Dir" value="event">
            事件模式
            <span class="mode-note">115 生活事件 API，仅 115 目录</span>
          </NRadio>
        </div>
      </NRadioGroup>
    </SettingsField>

    <SettingsField label="性能模式" hint="降低资源占用，适合目录内文件很多的情况" width="sm">
      <NSwitch v-model:value="performanceMode" />
    </SettingsField>

    <SettingsField label="监控目录" width="full">
      <div class="dir-block">
        <div class="dir-header">
          <span class="dir-count">已添加 {{ watchDirs.length }} 个</span>
          <NButton size="small" @click="showFolderBrowser = true">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            添加目录
          </NButton>
        </div>

        <div class="dir-list">
          <NEmpty v-if="watchDirs.length === 0" description="暂无监控目录" size="small" />
          <NList v-else>
            <NListItem v-for="(dir, index) in watchDirs" :key="dir">
              <div class="dir-item">
                <NIcon :component="FolderOutline" :size="18" class="dir-icon" />
                <span class="dir-path">{{ dir }}</span>
                <NButton
                  quaternary
                  circle
                  size="small"
                  aria-label="移除该监控目录"
                  @click="handleRemoveDir(index)"
                >
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                </NButton>
              </div>
            </NListItem>
          </NList>
        </div>
      </div>
    </SettingsField>

    <template #actions>
      <NButton type="primary" :loading="saving" @click="submit">保存配置</NButton>
    </template>
  </SettingsSection>

  <!-- 文件夹选择弹窗 -->
  <FolderBrowserModal
    v-model:show="showFolderBrowser"
    title="添加监控目录"
    @confirm="handleAddDir"
  />
</template>

<style scoped>
.mode-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mode-note {
  margin-left: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-2);
}

.dir-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.dir-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.dir-count {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.dir-list {
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  min-height: 96px;
  max-height: 240px;
  overflow-y: auto;
}

.dir-list :deep(.n-empty) {
  padding: var(--space-6);
}

.dir-list :deep(.n-list) {
  background: transparent;
}

.dir-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

/* 文件夹图标取中性色：警告色留给真正的告警 */
.dir-icon {
  flex-shrink: 0;
  color: var(--text-3);
}

.dir-path {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
