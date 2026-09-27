/**
 * 布局层公共类型
 *
 * 单独成文件的原因：`<script setup>` 不允许 ES 模块导出，
 * 而命令面板的动作项类型需要被 AppLayout 共享。
 */

/** 命令面板中的动作项（跳转项由面板按路由 meta 自行生成） */
export interface CommandAction {
  /** 动作标识，选中后经 run 事件回抛 */
  key: string
  label: string
  hint?: string
  /** 检索关键词：补标题里没有的俗称与英文名 */
  keywords?: string[]
}
