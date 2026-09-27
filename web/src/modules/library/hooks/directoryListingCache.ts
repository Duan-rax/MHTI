/**
 * 目录列表缓存与 path → file_id 索引（文件浏览用）
 *
 * 放进独立文件的原因有两个：
 * 1. 它是纯数据层（键、TTL、上限、登记），与「谁在什么时候请求」无关，
 *    留在 useDirectoryBrowser 里会把加载编排与数据存放大杂烩成一坨；
 * 2. useDirectoryBrowser 已接近 300 行上限。
 *
 * 缓存键用 fileId 优先、path 兜底：115 的目录身份是 file_id（同名目录、改名
 * 之后 path 都不作数），本地目录没有 id，只能按 path 认。
 */

import type { BrowseResponse, StorageProvider } from '@/shared/types/common'

/** 缓存有效期：过了就当没缓存，重新问后端 */
export const CACHE_TTL_MS = 60_000
/** 缓存条目上限（每条一个目录页），超出先扔最早写入的 */
const CACHE_MAX_ENTRIES = 50

interface CachedListing {
  at: number
  response: BrowseResponse
}

export function buildListingKey(
  provider: StorageProvider,
  path: string,
  page: number,
  pageSize: number,
  fileId: string | null | undefined,
): string {
  return `${provider}|${fileId || path}|${page}|${pageSize}`
}

export class DirectoryListingCache {
  private readonly listings = new Map<string, CachedListing>()
  /** path → 目录 file_id：面包屑回跳要靠它带上正确的目录 id */
  private readonly dirIdByPath = new Map<string, string>()

  read(key: string): BrowseResponse | null {
    const hit = this.listings.get(key)
    if (!hit) return null
    if (Date.now() - hit.at > CACHE_TTL_MS) {
      this.listings.delete(key)
      return null
    }
    return hit.response
  }

  write(key: string, response: BrowseResponse): void {
    if (this.listings.size >= CACHE_MAX_ENTRIES) {
      const oldest = this.listings.keys().next().value
      if (oldest !== undefined) this.listings.delete(oldest)
    }
    this.listings.set(key, { at: Date.now(), response })
    this.remember(response)
  }

  has(key: string): boolean {
    return this.read(key) !== null
  }

  /** 登记这次结果里出现的所有目录 id（当前目录、父目录、每个子目录） */
  remember(response: BrowseResponse): void {
    if (response.current_path && response.current_file_id) {
      this.dirIdByPath.set(response.current_path, response.current_file_id)
    }
    if (response.parent_path && response.parent_file_id) {
      this.dirIdByPath.set(response.parent_path, response.parent_file_id)
    }
    for (const entry of response.entries) {
      if (entry.is_dir && entry.file_id) this.dirIdByPath.set(entry.path, entry.file_id)
    }
  }

  fileIdFor(path: string): string | null {
    return this.dirIdByPath.get(path) ?? null
  }
}
