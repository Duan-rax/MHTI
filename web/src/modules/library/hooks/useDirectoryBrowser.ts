import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, type DataTableRowKey } from 'naive-ui'
import { fsApi } from '@/shared/api/fs'
import type {
  BrowseResponse,
  DirectoryEntry,
  StorageLocator,
  StorageProvider,
} from '@/shared/types/common'
import {
  DirectoryListingCache,
  buildListingKey,
} from '@/modules/library/hooks/directoryListingCache'
import { splitPathSegments } from '@/modules/library/utils'

/** 悬停预取延迟：扫过列表时不要每滑过一行就发请求 */
const PREFETCH_DELAY_MS = 150

/**
 * 目录浏览（含 115 provider 与 file_id 跟踪、URL 同步）/导航/面包屑/
 * 本地过滤/分页。顶层直接调用 loadDirectory 的语义（原 setup 顶层副作用）
 * 保留在 hook 内同样位置。
 *
 * 加载策略（实测：115 一次往返 0.06~3.1s，构造 client 与读配置可忽略，带 file_id
 * 浏览已是最少往返，瓶颈是网络本身且抖动极大）：命中缓存直接渲染（返回上级、
 * 面包屑回跳、翻页、重复进入都不发请求）；未命中才请求且同键请求合并成一个；
 * 桌面端悬停 115 目录行预取第一页（本地 2~10ms 不预取）；面包屑回跳按 path 查
 * file_id——115 深度 ≥3 时原文复用「当前目录」的 id，列表根本不动。
 * 缓存与 file_id 索引的实现见 directoryListingCache.ts。
 */
export function useDirectoryBrowser() {
  const route = useRoute()
  const router = useRouter()
  const message = useMessage()

  const loading = ref(false)
  const entries = ref<DirectoryEntry[]>([])
  const currentPath = ref('')
  const parentPath = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const search = ref('')
  const checkedRowKeys = ref<DataTableRowKey[]>([])

  // 存储提供方跟踪
  const currentProvider = ref<StorageProvider>('local')
  const currentFileId = ref<string | null>(null)
  // 父目录的 file_id（来自后端响应）
  const parentFileId = ref<string | null>(null)

  /* ---------------- 目录列表缓存与 file_id 索引 ---------------- */

  // 目录页缓存 + path→file_id 索引（见 directoryListingCache.ts）
  const cache = new DirectoryListingCache()
  // 正在飞行的请求：同一目录的重复点击合并成一次请求
  const inflight = new Map<string, Promise<BrowseResponse>>()
  // 已预取的键（含失败，避免反复触发）
  const prefetchedKeys = new Set<string>()
  // 预取计时器：悬停去抖；请求序号：快速连点时只让最后一次的结果落地
  let prefetchTimer: ReturnType<typeof setTimeout> | null = null
  let loadToken = 0

  // URL 初始化
  const initPath = computed(() => (route.query.root as string) || '')
  const initPage = computed(() => parseInt(route.query.page as string) || 1)

  // 面包屑分段（纯字符串处理，实现在 utils）
  const pathSegments = computed(() => splitPathSegments(currentPath.value))

  // 本地关键字过滤
  const filteredEntries = computed(() => {
    if (!search.value) return entries.value
    const keyword = search.value.toLowerCase()
    return entries.value.filter((e) => e.name.toLowerCase().includes(keyword))
  })

  // 把一次浏览结果落到页面状态（缓存命中与真实请求共用，行为一致）
  const applyResponse = (response: BrowseResponse, requestedPage: number) => {
    entries.value = response.entries
    currentPath.value = response.current_path
    parentPath.value = response.parent_path
    total.value = response.total
    page.value = response.page
    // 优先用后端返回的 file_id（115 子目录必须），fallback 到请求时的值
    currentFileId.value = response.current_file_id ?? currentFileId.value ?? null
    parentFileId.value = response.parent_file_id ?? null
    // 写进缓存的同时登记 path→file_id（面包屑回跳要用）
    cache.remember(response)

    // 更新 URL（仅本地路径写 URL，115 路径不持久化到 URL）
    if (currentProvider.value === 'local') {
      router.replace({
        query: {
          ...(response.current_path ? { root: response.current_path } : {}),
          ...(requestedPage > 1 ? { page: requestedPage.toString() } : {}),
        },
      })
    }
  }

  // 加载目录
  const loadDirectory = async (
    path: string = '',
    p: number = 1,
    provider?: StorageProvider,
    fileId?: string | null,
  ) => {
    const effectiveProvider = provider ?? currentProvider.value
    const effectiveFileId = fileId !== undefined ? fileId : currentFileId.value
    // 键用「本次请求的参数」算，不能先改 currentProvider/currentFileId 再算
    const key = buildListingKey(effectiveProvider, path, p, pageSize.value, effectiveFileId)

    const cached = cache.read(key)
    if (cached) {
      // 命中缓存同样要让在飞的旧请求失效：否则先前那个请求落地时会把刚渲染的
      // 这个目录覆盖掉（连点两个目录时发生）
      loadToken += 1
      loading.value = false
      currentProvider.value = effectiveProvider
      if (effectiveFileId !== undefined) currentFileId.value = effectiveFileId ?? null
      applyResponse(cached, p)
      return
    }

    const token = ++loadToken
    loading.value = true
    try {
      let request = inflight.get(key)
      if (!request) {
        request = fsApi.browse(path, p, pageSize.value, effectiveProvider, effectiveFileId ?? null)
        inflight.set(key, request)
        // 请求结束后无论成败都从在飞表里摘掉，否则失败会被永久缓存
        void request.finally(() => inflight.delete(key))
      }
      const response = await request
      cache.write(key, response)
      if (token !== loadToken) return
      currentProvider.value = effectiveProvider
      if (effectiveFileId !== undefined) currentFileId.value = effectiveFileId ?? null
      applyResponse(response, p)
    } catch (error: unknown) {
      if (token !== loadToken) return
      const err = error as { response?: { data?: { error?: { message?: string } } } }
      message.error(err?.response?.data?.error?.message || '加载目录失败')
      console.error(error)
    } finally {
      if (token === loadToken) loading.value = false
    }
  }

  /**
   * 预取目录第一页（桌面端悬停行时调用）
   *
   * 只对 115 预取：本地目录一次往返 2~10ms 预取无收益，反而会因鼠标恰好停在某行
   * （列表重绘后浏览器会重新判定 hover）产生无谓请求；115 一次往返 0.1~3s 才值得。
   * 失败一律静默：真进去时走正常加载并报错。
   */
  const prefetchDirectory = (entry: DirectoryEntry) => {
    if (!entry.is_dir) return
    const provider = (entry.provider || currentProvider.value) as StorageProvider
    // 115 必须带 file_id 才能定位目录
    if (provider !== '115' || !entry.file_id) return
    const fileId = entry.file_id
    const key = buildListingKey(provider, entry.path, 1, pageSize.value, fileId)
    if (cache.has(key) || inflight.has(key) || prefetchedKeys.has(key)) return

    if (prefetchTimer) clearTimeout(prefetchTimer)
    prefetchTimer = setTimeout(() => {
      prefetchTimer = null
      if (cache.has(key) || inflight.has(key)) return
      prefetchedKeys.add(key)
      const request = fsApi.browse(entry.path, 1, pageSize.value, provider, fileId)
      inflight.set(key, request)
      void request
        .then((response) => {
          cache.write(key, response)
        })
        .catch(() => {
          /* 预取失败不打扰用户 */
        })
        .finally(() => inflight.delete(key))
    }, PREFETCH_DELAY_MS)
  }

  // 进入目录
  const enterDirectory = (entry: DirectoryEntry) => {
    if (!entry.is_dir) return
    page.value = 1
    search.value = ''
    checkedRowKeys.value = []
    // 点击虚拟 115 根入口 → 切到 115 provider
    if (entry.is_virtual && entry.provider === '115') {
      loadDirectory(entry.path, 1, '115', entry.file_id ?? '0')
      return
    }
    // 同 provider 内进入子目录：115 用 file_id，本地用 path
    if (currentProvider.value === '115') {
      loadDirectory(entry.path, 1, '115', entry.file_id ?? null)
    } else {
      loadDirectory(entry.path, 1, 'local', null)
    }
  }

  // 返回上级
  const goUp = () => {
    page.value = 1
    search.value = ''
    checkedRowKeys.value = []
    if (parentPath.value === null) {
      // 115 根的上级 → 回到本地根
      if (currentProvider.value === '115') {
        loadDirectory('', 1, 'local', null)
      }
      return
    }
    // 用后端响应里的父目录 file_id（115 必须），本地为 null 走 path
    loadDirectory(parentPath.value, 1, currentProvider.value, parentFileId.value)
  }

  // 跳转到指定路径（面包屑）
  const goToPath = (path: string) => {
    page.value = 1
    search.value = ''
    checkedRowKeys.value = []
    // "根目录"面包屑 → 回到本地根（最顶层，含盘符 + 115 入口），无论当前 provider
    if (path === '') {
      loadDirectory('', 1, 'local', null)
      return
    }
    // 115 根层级（/115网盘）→ file_id 固定为 '0'
    if (path === '/115网盘') {
      loadDirectory('/115网盘', 1, '115', '0')
      return
    }
    // 其他层级：带上该路径已知的 file_id（115 必须带对，否则后端按「当前目录」
    // 解析，点祖先面包屑列表不动）；本地路径传 null 走 path
    loadDirectory(path, 1, currentProvider.value, cache.fileIdFor(path))
  }

  // 回到根目录
  const goToRoot = () => {
    goToPath('')
  }

  // 分页
  const handlePageChange = (p: number) => {
    page.value = p
    checkedRowKeys.value = []
    loadDirectory(currentPath.value, p)
  }

  // 构造当前路径的 StorageLocator（115 场景）
  const buildLocatorFor = (path: string, fileId: string | null | undefined): StorageLocator => {
    if (currentProvider.value === '115') {
      return { provider: '115', path, file_id: fileId ?? currentFileId.value, is_dir: true }
    }
    return { provider: 'local', path, is_dir: true }
  }

  // URL 变化时重载（仅本地）
  watch(
    () => route.query,
    () => {
      const path = (route.query.root as string) || ''
      const p = parseInt(route.query.page as string) || 1
      if (path !== currentPath.value || p !== page.value) {
        loadDirectory(path, p, 'local', null)
      }
    },
    { immediate: false }
  )

  // 初始加载（默认本地）—— 原 setup 顶层副作用，位置保持一致
  loadDirectory(initPath.value, initPage.value, 'local', null)

  return {
    loading,
    entries,
    currentPath,
    parentPath,
    total,
    page,
    pageSize,
    search,
    checkedRowKeys,
    currentProvider,
    currentFileId,
    filteredEntries,
    pathSegments,
    loadDirectory,
    prefetchDirectory,
    enterDirectory,
    goUp,
    goToPath,
    goToRoot,
    handlePageChange,
    buildLocatorFor,
  }
}