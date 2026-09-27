/**
 * Naive UI 主题覆盖 — 由配色方案生成，亮/暗共用一份配置
 *
 * 为什么用工厂而不是两份静态对象：亮暗差异**只有颜色**，尺寸/圆角/字体完全一致。
 * 两份文件各自展开会持续漂移（改一处忘另一处），故收敛为 buildThemeOverrides()。
 *
 * 调整规则：颜色一律从 palette 取；尺寸一律从 radius / controlHeight / fontSizes 取，
 * 禁止在本文件里写魔法数字。
 */
import type { GlobalThemeOverrides } from 'naive-ui'
import { controlHeight, darkPalette, fonts, fontSizes, lightPalette, radius } from './themeTokens'
import type { Palette } from './themeTokens'

/** 控件内边距（与高度档位配套，保证文字不贴边） */
const controlPadding = {
  tiny: '0 8px',
  small: '0 10px',
  medium: '0 14px',
  large: '0 18px',
} as const

/**
 * 生成 Naive UI 主题覆盖
 *
 * @param isDark 是否暗色模式
 */
export function buildThemeOverrides(isDark: boolean): GlobalThemeOverrides {
  const c: Palette = isDark ? darkPalette : lightPalette

  return {
    common: {
      // -------------------- 品牌与语义色 --------------------
      primaryColor: c.brand[500],
      primaryColorHover: c.brand[600],
      primaryColorPressed: c.brand[600],
      primaryColorSuppl: c.brand[600],
      successColor: c.success[500],
      successColorHover: c.success[600],
      successColorPressed: c.success[600],
      warningColor: c.warning[500],
      warningColorHover: c.warning[600],
      warningColorPressed: c.warning[600],
      errorColor: c.danger[500],
      errorColorHover: c.danger[600],
      errorColorPressed: c.danger[600],
      infoColor: c.info[500],
      infoColorHover: c.info[600],
      infoColorPressed: c.info[600],

      // -------------------- 文字（3 级即可，不设第 4 级） --------------------
      textColorBase: c.text1,
      textColor1: c.text1,
      textColor2: c.text1,
      textColor3: c.text2,
      textColorDisabled: c.text3,
      placeholderColor: c.text3,
      iconColor: c.text2,
      iconColorHover: c.text1,

      // -------------------- 表面与描边 --------------------
      bodyColor: c.bgPage,
      cardColor: c.bgSurface,
      modalColor: c.bgSurface,
      popoverColor: c.bgSurface,
      tableColor: c.bgSurface,
      tableHeaderColor: c.bgSubtle,
      inputColor: c.bgSurface,
      inputColorDisabled: c.bgHover,
      actionColor: c.bgSubtle,
      tagColor: c.bgHover,
      hoverColor: c.bgHover,
      borderColor: c.border1,
      dividerColor: c.border1,

      // -------------------- 浮层阴影 --------------------
      boxShadow1: c.shadow.sm,
      boxShadow2: c.shadow.lg,
      boxShadow3: c.shadow.xl,

      // -------------------- 尺寸与圆角（亮暗一致） --------------------
      borderRadius: radius.md,
      borderRadiusSmall: radius.sm,

      // -------------------- 字体与行高 --------------------
      fontFamily: fonts.sans,
      fontFamilyMono: fonts.mono,
      fontSize: fontSizes.base,
      fontSizeMini: fontSizes.xs,
      fontSizeTiny: fontSizes.xs,
      fontSizeSmall: fontSizes.sm,
      fontSizeMedium: fontSizes.base,
      fontSizeLarge: fontSizes.md,
      fontSizeHuge: fontSizes.lg,
      lineHeight: '1.55',

      heightTiny: controlHeight.tiny,
      heightSmall: controlHeight.small,
      heightMedium: controlHeight.medium,
      heightLarge: controlHeight.large,
      heightHuge: controlHeight.huge,
    },

    // 卡片：实心 + 描边表达边界，不叠阴影（层次靠间距建立）
    Card: {
      borderRadius: radius.lg,
      color: c.bgSurface,
      borderColor: c.border1,
      paddingSmall: '12px 16px',
      paddingMedium: '16px 20px',
      paddingLarge: '20px 24px',
      paddingHuge: '24px 28px',
      boxShadow: 'none',
    },

    Button: {
      borderRadiusTiny: radius.xs,
      borderRadiusSmall: radius.sm,
      borderRadiusMedium: radius.sm,
      borderRadiusLarge: radius.md,
      heightTiny: controlHeight.tiny,
      heightSmall: controlHeight.small,
      heightMedium: controlHeight.medium,
      heightLarge: controlHeight.large,
      fontSizeTiny: fontSizes.xs,
      fontSizeSmall: fontSizes.sm,
      fontSizeMedium: fontSizes.base,
      fontSizeLarge: fontSizes.md,
      fontWeight: '500',
      fontWeightStrong: '600',
      paddingTiny: controlPadding.tiny,
      paddingSmall: controlPadding.small,
      paddingMedium: controlPadding.medium,
      paddingLarge: controlPadding.large,
      // 实心主按钮的文字色必须跟随明暗：亮色下主色较深→白字；
      // 暗色下主色提亮→必须转深字，否则白字落在浅紫底上只有 2.2:1，远低于 WCAG AA
      textColorPrimary: c.textOnBrand,
      textColorPrimaryHover: c.textOnBrand,
      textColorPrimaryPressed: c.textOnBrand,
      textColorPrimaryFocus: c.textOnBrand,
      textColorInfo: c.textOnBrand,
      textColorInfoHover: c.textOnBrand,
      textColorInfoPressed: c.textOnBrand,
      textColorInfoFocus: c.textOnBrand,
      // 文字按钮（quaternary）常态不显底色，仅 hover 时出现，减少视觉噪音
      textColorGhost: c.text2,
      textColorGhostHover: c.text1,
    },

    Input: {
      borderRadius: radius.md,
      heightTiny: controlHeight.tiny,
      heightSmall: controlHeight.small,
      heightMedium: controlHeight.medium,
      heightLarge: controlHeight.large,
      fontSize: fontSizes.base,
      paddingTiny: controlPadding.tiny,
      paddingSmall: controlPadding.small,
      paddingMedium: controlPadding.medium,
      paddingLarge: controlPadding.large,
      border: `1px solid ${c.border2}`,
      borderHover: `1px solid ${c.brand[500]}`,
      borderFocus: `1px solid ${c.brand[500]}`,
      boxShadowFocus: `0 0 0 3px ${c.brand[100]}`,
      color: c.bgSurface,
      colorFocus: c.bgSurface,
    },

    Select: {
      peers: {
        InternalSelection: {
          borderRadius: radius.md,
          heightTiny: controlHeight.tiny,
          heightSmall: controlHeight.small,
          heightMedium: controlHeight.medium,
          heightLarge: controlHeight.large,
          border: `1px solid ${c.border2}`,
          borderHover: `1px solid ${c.brand[500]}`,
          borderFocus: `1px solid ${c.brand[500]}`,
          borderActive: `1px solid ${c.brand[500]}`,
          boxShadowFocus: `0 0 0 3px ${c.brand[100]}`,
        },
        InternalSelectMenu: {
          borderRadius: radius.md,
          color: c.bgSurface,
          optionTextColorActive: c.brand[500],
          optionColorPending: c.bgHover,
        },
      },
    },

    // 顶部导航与移动端 TabBar 用 NMenu 渲染，故这里贴合导航形态调
    Menu: {
      borderRadius: radius.sm,
      itemHeight: '34px',
      itemColorHover: c.bgHover,
      itemColorActive: c.bgHover,
      itemColorActiveHover: c.bgHover,
      itemTextColor: c.text2,
      itemTextColorHover: c.text1,
      itemTextColorActive: c.text1,
      itemTextColorActiveHover: c.text1,
      itemIconColor: c.text2,
      itemIconColorHover: c.text1,
      itemIconColorActive: c.brand[500],
      itemIconColorActiveHover: c.brand[500],
      itemTextColorChildActive: c.text1,
    },

    // 设置页等用 NLayout 承载分组，保持与页面底色一致，不做二次区分
    Layout: {
      color: c.bgPage,
      siderColor: c.bgSurface,
      siderBorderColor: c.border1,
      headerColor: c.bgSurface,
      headerBorderColor: c.border1,
      footerColor: c.bgSurface,
      footerBorderColor: c.border1,
    },

    // 表格：紧凑行高 + 极淡表头，行分隔线替代整行边框
    DataTable: {
      borderRadius: radius.lg,
      borderColor: c.border1,
      thColor: c.bgSubtle,
      thTextColor: c.text2,
      thFontWeight: '600',
      thPaddingSmall: '8px 12px',
      thPaddingMedium: '10px 14px',
      tdColor: c.bgSurface,
      tdColorHover: c.bgHover,
      tdColorStriped: c.bgSubtle,
      tdPaddingSmall: '8px 12px',
      tdPaddingMedium: '10px 14px',
      tdTextColor: c.text1,
      // naive 的 loading 遮罩默认不透明白，这里改为半透明以免闪白
      loadingColor: c.brand[500],
      borderColorHover: c.border1,
    },

    Tabs: {
      tabBorderRadius: radius.sm,
      tabTextColorLine: c.text2,
      tabTextColorActiveLine: c.text1,
      tabTextColorHoverLine: c.text1,
      barColor: c.brand[500],
      tabFontWeightActive: '600',
      tabPaddingMediumLine: '0 4px',
      tabGapMediumLine: '24px',
    },

    Tag: {
      borderRadius: radius.xs,
      heightSmall: '20px',
      heightMedium: '24px',
      heightLarge: '28px',
      fontSizeSmall: fontSizes.xs,
      fontSizeMedium: fontSizes.sm,
      fontSizeLarge: fontSizes.base,
      // 实心标签同样需要随明暗切换文字色，理由同 Button
      textColorPrimary: c.textOnBrand,
      textColorInfo: c.textOnBrand,
    },

    // 开关：与品牌色一致，不再沿用 iOS 的绿色（全站单一强调色的纪律）
    Switch: {
      railColor: c.bgActive,
      railColorActive: c.brand[500],
      boxShadowFocus: `0 0 0 3px ${c.brand[100]}`,
    },

    Slider: {
      railHeight: '3px',
      handleSize: '16px',
      fillColor: c.brand[500],
      fillColorHover: c.brand[600],
      railColor: c.bgActive,
      handleColor: c.bgSurface,
    },

    Progress: {
      railHeight: '4px',
      fillColor: c.brand[500],
      fontSizeCircle: '18px',
      fontWeightCircle: '600',
    },

    Checkbox: {
      borderRadius: radius.xs,
      colorChecked: c.brand[500],
      color: c.textOnBrand,
      border: `1px solid ${c.border2}`,
      borderChecked: `1px solid ${c.brand[500]}`,
    },

    // 注意 naive 的 Radio 变量语义与本项目其它控件相反，极易配错：
    //   --n-color            = 未选中圆点的填充色（不是选中色！）
    //   --n-color-active     = 选中圆点的填充色
    //   --n-dot-color-active = 选中时圆心的小点
    //   --n-box-shadow*      = 圆点的描边（naive 用 inset 阴影当边框画圆环）
    // 曾把 color 当成选中色填成品牌色，导致「所有未选中项都是实心紫圆盘、
    // 而真正选中的那一项是空圈」，看起来像三个都选中了。build 与类型检查都发现不了。
    Radio: {
      color: c.bgSurface,
      colorActive: c.brand[500],
      // 圆心小点：亮色下主色深→白点；暗色下主色浅→深点
      dotColorActive: c.textOnBrand,
      boxShadow: `inset 0 0 0 1px ${c.border2}`,
      boxShadowActive: `inset 0 0 0 1px ${c.brand[500]}`,
      boxShadowHover: `inset 0 0 0 1px ${c.brand[500]}`,
      // 键盘聚焦：品牌描边 + 一圈柔光环，与 Input 的聚焦处理保持一致
      boxShadowFocus: `inset 0 0 0 1px ${c.brand[500]}, 0 0 0 3px ${c.brand[100]}`,
    },

    Form: {
      labelFontSizeTopSmall: fontSizes.sm,
      labelFontSizeTopMedium: fontSizes.base,
      labelFontSizeTopLarge: fontSizes.md,
      labelFontSizeLeftSmall: fontSizes.base,
      labelFontSizeLeftMedium: fontSizes.base,
      labelFontSizeLeftLarge: fontSizes.md,
      labelTextColor: c.text2,
      feedbackFontSizeMedium: fontSizes.xs,
      feedbackHeightMedium: '20px',
      feedbackTextColorError: c.danger[500],
    },

    // 弹窗类：统一圆角与阴影，避免同一层级出现多种投影
    Dialog: {
      borderRadius: radius.xl,
      color: c.bgSurface,
      padding: '24px',
      titleFontSize: fontSizes.md,
      titleFontWeight: '600',
      fontSize: fontSizes.base,
    },
    Modal: {
      borderRadius: radius.xl,
      color: c.bgSurface,
      boxShadow: c.shadow.xl,
    },
    Drawer: {
      borderRadius: `0 ${radius.xl} ${radius.xl} 0`,
      color: c.bgSurface,
      headerPadding: '20px 24px',
      bodyPadding: '20px 24px',
      footerPadding: '16px 24px',
    },
    Popover: {
      borderRadius: radius.lg,
      padding: '14px 16px',
      color: c.bgSurface,
      boxShadow: c.shadow.lg,
    },
    Dropdown: {
      borderRadius: radius.md,
      color: c.bgSurface,
      optionTextColorHover: c.text1,
      optionColorHover: c.bgHover,
      optionHeightMedium: '34px',
      boxShadow: c.shadow.lg,
    },
    // 此处刻意不配置 Tooltip：naive 的 NTooltip 盒子（底色/内边距/圆角/投影）
    // 实际取自 Popover 主题键，Tooltip 键下的 color / padding / borderRadius
    // 均不生效，只有 textColor 生效。曾因此出现「白底 + 白字」的不可见 tooltip。
    // tooltip 皮肤统一在 global.css 的 .n-popover.n-tooltip 中定义。
    Message: {
      borderRadius: radius.lg,
      padding: '12px 16px',
      iconMargin: '0 10px 0 0',
      maxWidth: '380px',
      boxShadow: c.shadow.lg,
    },
    Notification: {
      borderRadius: radius.lg,
      padding: '16px',
      boxShadow: c.shadow.lg,
    },

    Collapse: {
      titlePadding: '14px 0',
      dividerColor: c.border1,
      titleTextColor: c.text1,
    },

    List: {
      borderRadius: radius.md,
      color: c.bgSurface,
      colorHover: c.bgHover,
      borderColor: c.border1,
    },

    Avatar: {
      borderRadius: radius.full,
      color: c.bgHover,
    },

    Badge: {
      fontFamily: fonts.sans,
      fontSize: fontSizes.xs,
      color: c.danger[500],
    },

    Skeleton: {
      borderRadius: radius.sm,
      color: c.bgHover,
      colorEnd: c.bgActive,
    },

    Empty: {
      iconColor: c.text3,
      textColor: c.text2,
    },

    Spin: {
      color: c.brand[500],
    },

    Divider: {
      color: c.border1,
      textColor: c.text2,
    },

    Descriptions: {
      thColor: c.bgSubtle,
      tdColor: c.bgSurface,
      thTextColor: c.text2,
      tdTextColor: c.text1,
      borderColor: c.border1,
      borderRadius: radius.md,
    },
  }
}
