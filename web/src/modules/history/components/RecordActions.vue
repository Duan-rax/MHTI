<script setup lang="ts">
/**
 * 记录行/卡片的重操作入口（重新整理 / 删除文件 / 删除记录）
 *
 * 为什么收进下拉：一行里同时摆「处理 + 重刮 + 重新整理 + 删除文件 + 删除」五颗按钮，
 * 表格右缘会变成一堵按钮墙，主次也就无从谈起。重刮是即时修正动作，留在行内；
 * 其余三个低频且部分不可逆的操作收进下拉，删除项用危险色标注。
 */
import { computed } from 'vue'
import { NButton, NDropdown, NIcon } from 'naive-ui'
import { EllipsisHorizontalOutline } from '@vicons/ionicons5'
import type { HistoryRecord } from '@/modules/history/types'

const props = defineProps<{
  record: HistoryRecord
  busy?: boolean
  /**
   * 隐藏「删除记录」项（详情页用：撤销条与删除都在列表页）
   *
   * 必须用反向的「隐藏」而不是 includeDelete：Vue 对 Boolean 类型 prop 缺省时
   * 按 false 处理，`includeDelete !== false` 会永远不成立，删除项被静默吃掉。
   */
  hideDelete?: boolean
}>()

const emit = defineEmits<{
  reorganize: [record: HistoryRecord]
  'delete-files': [record: HistoryRecord]
  delete: [record: HistoryRecord]
}>()

type ActionKey = 'reorganize' | 'delete-files' | 'delete'

const options = computed(() => {
  const items: Array<{
    key: ActionKey
    label: string
    props?: Record<string, string>
  }> = [
    { key: 'reorganize', label: '用已存元数据重新整理' },
    { key: 'delete-files', label: '删除源文件 / 刮削产物…' },
  ]
  if (!props.hideDelete) {
    items.push({
      key: 'delete',
      label: '删除记录',
      // 破坏性操作在菜单里就标出危险色，不要等弹窗才告诉用户
      props: { style: 'color: var(--danger-500)' },
    })
  }
  return items
})

function handleSelect(key: string, record: HistoryRecord) {
  if (key === 'reorganize') emit('reorganize', record)
  else if (key === 'delete-files') emit('delete-files', record)
  else if (key === 'delete') emit('delete', record)
}
</script>

<template>
  <NDropdown
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
    :options="options"
    @select="(key: string) => handleSelect(key, record)"
  >
    <!-- click.stop 必需：表格行自身绑了「点击进详情」，触发器冒泡上去会被当成行点击 -->
    <NButton
      size="tiny"
      quaternary
      :disabled="busy"
      :aria-label="`更多操作 #${record.display_id}`"
      @click.stop
    >
      <template #icon>
        <NIcon :component="EllipsisHorizontalOutline" :size="16" />
      </template>
    </NButton>
  </NDropdown>
</template>
