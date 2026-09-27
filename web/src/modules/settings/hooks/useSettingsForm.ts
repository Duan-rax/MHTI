/**
 * 设置分组的「加载 / 保存 / 错误」状态（settings 域私有）
 *
 * 原先 11 个面板各写一份 try/catch：加载失败只 console.error（页面上一片空白，
 * 用户不知道是没配还是没读到），保存失败弹个 toast 就没了。这里统一成：
 * - loadError：渲染在卡片里（SettingsSection 的 error 属性）+ 重试按钮；
 * - saveError：渲染在操作区上方，保留用户已填内容；
 * - submit 成功才提示成功文案，失败只落 saveError，不再弹第二遍 toast。
 *
 * @param options.load 拉取配置（写进各面板自己的 ref）
 * @param options.save 提交配置
 * @param options.successText 保存成功文案
 */
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

/** 后端 detail 优先：拦截器只 reject 原始 axios error，直接读 message 会是英文状态码 */
export function describeError(error: unknown, fallback = '操作失败'): string {
  const err = error as { response?: { data?: { detail?: string } }; message?: string }
  return err?.response?.data?.detail || err?.message || fallback
}

export function useSettingsForm(options: {
  load?: () => Promise<void>
  save?: () => Promise<void>
  successText?: string
}) {
  const message = useMessage()
  const loading = ref(false)
  const saving = ref(false)
  const loadError = ref('')
  const saveError = ref('')

  /** 拉配置：失败写 loadError，让卡片渲染错误态而不是留空 */
  const reload = async () => {
    if (!options.load) return
    loading.value = true
    loadError.value = ''
    try {
      await options.load()
    } catch (error) {
      loadError.value = describeError(error, '加载配置失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  /** 提交：并发保护 + 成功后清掉上一次的错误条 */
  const submit = async () => {
    if (!options.save || saving.value) return
    saving.value = true
    saveError.value = ''
    try {
      await options.save()
      if (options.successText) message.success(options.successText)
    } catch (error) {
      saveError.value = describeError(error, '保存失败')
      console.error(error)
    } finally {
      saving.value = false
    }
  }

  /** 表单校验类提示：仍然是临时的 toast（字段级校验见 worklog 未修问题） */
  const warn = (text: string) => message.warning(text)

  return { loading, saving, loadError, saveError, reload, submit, warn }
}
