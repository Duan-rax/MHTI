import { ref } from 'vue'
import * as logsApi from '@/shared/api/logs'
import type { LogConfig } from '@/shared/types/common'
import { useSettingsForm } from '@/modules/settings/hooks/useSettingsForm'

/**
 * 日志配置（LogSettings ① 日志配置卡）
 *
 * 8 字段配置的加载与保存；默认值保持原样，错误处理交给 useSettingsForm：
 * 加载失败给 loadError（卡片里显示原因 + 重试），保存失败给 saveError。
 */
export function useLogConfig() {
  const config = ref<LogConfig>({
    log_level: 'INFO',
    console_enabled: true,
    file_enabled: true,
    db_enabled: true,
    max_file_size_mb: 10,
    max_file_count: 5,
    db_retention_days: 30,
    realtime_enabled: true,
  })

  const load = async () => {
    config.value = await logsApi.getLogConfig()
  }

  const save = async () => {
    config.value = await logsApi.updateLogConfig(config.value)
  }

  const { loading, saving, loadError, saveError, reload, submit } = useSettingsForm({
    load,
    save,
    successText: '日志配置已保存',
  })

  return {
    configLoading: loading,
    configSaving: saving,
    config,
    loadError,
    saveError,
    loadConfig: reload,
    saveConfig: submit,
  }
}
