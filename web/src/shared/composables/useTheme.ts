import { computed, watchEffect } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { darkTheme, type GlobalTheme, type GlobalThemeOverrides } from 'naive-ui'
import { buildThemeOverrides } from '@/shared/styles/themeOverrides'

export function useTheme() {
  const themeStore = useThemeStore()

  const theme = computed<GlobalTheme | null>(() => {
    return themeStore.isDark ? darkTheme : null
  })

  // 亮/暗仅颜色不同，尺寸与圆角一致，故由同一工厂按模式生成
  const themeOverrides = computed<GlobalThemeOverrides>(() =>
    buildThemeOverrides(themeStore.isDark),
  )

  const isDark = computed(() => themeStore.isDark)

  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  // 同步 dark class 到 document，用于 CSS 变量切换
  watchEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', themeStore.isDark)
    root.style.colorScheme = themeStore.isDark ? 'dark' : 'light'
  })

  return {
    theme,
    themeOverrides,
    isDark,
    toggleTheme,
  }
}
