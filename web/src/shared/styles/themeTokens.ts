/**
 * 设计令牌（TS 侧单一真源）
 *
 * 与 design-tokens.css 保持一一对应：CSS 变量供样式表消费，本文件供
 * Naive UI 主题覆盖与 TS 逻辑（图表取值等）消费。改颜色/圆角时**两处都要改**，
 * 新增令牌前先确认现有档位不够用。
 *
 * 命名与语义见 design-tokens.css 顶部说明（克制 / 层次 / 一致 / 功能优先）。
 */

/** 语义色键（与 CSS 中的 --{key}-500 对应） */
export type SemanticTone = 'brand' | 'success' | 'warning' | 'danger' | 'info'

/** 一套配色方案（亮色或暗色）下的全部取色点 */
export interface Palette {
  /** 文字：主 / 次 / 极弱 */
  text1: string
  text2: string
  text3: string
  textOnBrand: string

  /** 背景：页面底 / 表面 / 次级表面 / 悬浮 / 按下 */
  bgPage: string
  bgSurface: string
  bgSubtle: string
  bgHover: string
  bgActive: string

  /** 描边：常规 / 强 */
  border1: string
  border2: string

  /** 品牌色阶（50 底色 / 500 主色 / 600 深色） */
  brand: { 50: string; 100: string; 500: string; 600: string }
  /** 语义色（各 3 档） */
  success: { 50: string; 500: string; 600: string }
  warning: { 50: string; 500: string; 600: string }
  danger: { 50: string; 500: string; 600: string }
  info: { 50: string; 500: string; 600: string }

  /** RGB 三元组（'R G B'），用于 rgb(var(--x-rgb) / 12%) 这类 alpha 合成 */
  rgb: { brand: string; success: string; warning: string; danger: string; info: string }

  /** 阴影四档 */
  shadow: { xs: string; sm: string; md: string; lg: string; xl: string }
}

/** 亮色配色（与 design-tokens.css :root 一致） */
export const lightPalette: Palette = {
  text1: '#1c1c1a',
  text2: '#6e6e66',
  text3: '#8a8a82',
  textOnBrand: '#ffffff',

  bgPage: '#f8f8f6',
  bgSurface: '#ffffff',
  bgSubtle: '#fcfcfb',
  bgHover: '#f1f1ee',
  bgActive: '#e4e4df',

  border1: '#e4e4df',
  border2: '#d0d0c9',

  brand: { 50: '#f3f2fa', 100: '#e8e6f5', 500: '#6b62b4', 600: '#574f9a' },
  success: { 50: '#edf5ef', 500: '#3f7d51', 600: '#356846' },
  warning: { 50: '#faf2e6', 500: '#966c29', 600: '#7d5a22' },
  danger: { 50: '#faedec', 500: '#a84a43', 600: '#8d3d37' },
  info: { 50: '#edf2f6', 500: '#476f87', 600: '#3a5b6f' },

  /** RGB 三元组：供需要 alpha 合成的场景使用（与 design-tokens.css 的 --*-rgb 对应） */
  rgb: {
    brand: '107 98 180',
    success: '63 125 81',
    warning: '150 108 41',
    danger: '168 74 67',
    info: '71 111 135',
  },

  shadow: {
    xs: '0 1px 1px rgba(28, 28, 26, 0.03)',
    sm: '0 1px 2px rgba(28, 28, 26, 0.04), 0 1px 1px rgba(28, 28, 26, 0.03)',
    md: '0 2px 6px rgba(28, 28, 26, 0.05), 0 1px 2px rgba(28, 28, 26, 0.04)',
    lg: '0 8px 20px rgba(28, 28, 26, 0.07), 0 2px 6px rgba(28, 28, 26, 0.04)',
    xl: '0 16px 40px rgba(28, 28, 26, 0.1), 0 4px 10px rgba(28, 28, 26, 0.05)',
  },
}

/** 暗色配色（与 design-tokens.css .dark 一致；深暖灰而非纯黑） */
export const darkPalette: Palette = {
  text1: '#f2f2ef',
  text2: '#a4a49d',
  text3: '#75756f',
  textOnBrand: '#14131f',

  bgPage: '#131312',
  bgSurface: '#1b1b1a',
  bgSubtle: '#232322',
  bgHover: '#2a2a28',
  bgActive: '#333330',

  border1: '#2e2e2c',
  border2: '#3d3d3a',

  brand: { 50: '#26243a', 100: '#2f2c47', 500: '#9a93d8', 600: '#b3adde' },
  success: { 50: '#1e2a21', 500: '#6cae80', 600: '#8bc39c' },
  warning: { 50: '#2a2419', 500: '#c99a4e', 600: '#dbb069' },
  danger: { 50: '#2b1f1e', 500: '#d1776f', 600: '#e0928b' },
  info: { 50: '#1c2529', 500: '#6f9cb4', 600: '#8bb2c7' },

  rgb: {
    brand: '154 147 216',
    success: '108 174 128',
    warning: '201 154 78',
    danger: '209 119 111',
    info: '111 156 180',
  },

  shadow: {
    xs: '0 1px 1px rgba(0, 0, 0, 0.24)',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(0, 0, 0, 0.24)',
    md: '0 2px 6px rgba(0, 0, 0, 0.36), 0 1px 2px rgba(0, 0, 0, 0.28)',
    lg: '0 8px 20px rgba(0, 0, 0, 0.44), 0 2px 6px rgba(0, 0, 0, 0.3)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.52), 0 4px 10px rgba(0, 0, 0, 0.34)',
  },
}

/** 圆角档位：每页最多用 3 种，避免大小不一 */
export const radius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

/** 控件高度档位（桌面基准；移动端由 CSS 保底 44px 触摸目标） */
export const controlHeight = {
  tiny: '24px',
  small: '30px',
  medium: '36px',
  large: '44px',
  huge: '52px',
} as const

/** 字体 */
export const fonts = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
} as const

/** 字号（与 --text-* 同步） */
export const fontSizes = {
  xs: '12px',
  sm: '13px',
  base: '14px',
  md: '15px',
  lg: '17px',
  xl: '20px',
  '2xl': '26px',
  '3xl': '32px',
} as const

/** 按语义取色：用于图表、状态点等需要按 tone 取值的场景 */
export function toneColor(palette: Palette, tone: SemanticTone): string {
  return palette[tone][500]
}

/** 按语义取浅底色 */
export function toneSurface(palette: Palette, tone: SemanticTone): string {
  return palette[tone][50]
}
