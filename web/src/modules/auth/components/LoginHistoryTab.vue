<script setup lang="ts">
/**
 * 登录历史 tab（纯展示，抽屉用）
 *
 * 数据与分页在父组件（useLoginHistory）；NDataTable 参数
 * （size="small" :max-height="240" :remote="true"）逐字保留，
 * 与安全页版本不共享（安全页无这些参数）。
 */
import { NDataTable, NSpin, type DataTableColumns } from 'naive-ui'
import type { LoginHistoryItem } from '@/modules/auth/api'

defineProps<{
  columns: DataTableColumns<LoginHistoryItem>
  items: LoginHistoryItem[]
  loading: boolean
  pagination: { page: number; pageSize: number; itemCount: number }
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <div>
    <NSpin :show="loading">
      <NDataTable
        :columns="columns"
        :data="items"
        :pagination="pagination"
        :remote="true"
        size="small"
        :max-height="240"
        @update:page="emit('update:page', $event)"
      />
    </NSpin>
  </div>
</template>
