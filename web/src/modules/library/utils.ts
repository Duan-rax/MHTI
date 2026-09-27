/**
 * library 域展示格式化
 *
 * FilesPage 与 ScanResultTable 各自的内联实现输出逐字相同（已用 16 组
 * size / 6 组时间输入比对，零差异），故收敛于此。formatSize 保留
 * `null → '-'` 分支：FilesPage 的 size 可为 null，非空输入输出不变。
 */

/**
 * 格式化文件大小（B / KB / MB / GB）
 * @param size 字节数，null 显示 '-'
 */
export const formatSize = (size: number | null) => {
  if (size === null) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

/**
 * 格式化修改时间（zh-CN 本地化完整日期时间）
 * @param mtime ISO 时间字符串，空值显示 '-'
 */
export const formatTime = (mtime: string | null) => {
  if (!mtime) return '-'
  const date = new Date(mtime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 把当前目录路径切成面包屑分段
 *
 * 分段逻辑从 useDirectoryBrowser 搬来（纯字符串处理，与请求无关）：
 * Windows 盘符形态（`C:\A\B`）逐段拼回反斜杠，Unix 形态（`/a/b`）逐段拼斜杠，
 * `C:\` 归一段、`C:\A` 不带尾斜杠——与搬迁前的输出逐字一致。
 */
export const splitPathSegments = (path: string): { name: string; path: string }[] => {
  if (!path) return []
  const segments: { name: string; path: string }[] = []
  const parts = path.split(/[/\\]/).filter(Boolean)
  if (path.match(/^[A-Z]:\\/i)) {
    let accPath = ''
    parts.forEach((part, index) => {
      if (index === 0) {
        accPath = part + '\\'
        segments.push({ name: part, path: accPath })
      } else {
        accPath = accPath + part + '\\'
        segments.push({ name: part, path: accPath.slice(0, -1) })
      }
    })
  } else {
    let accPath = ''
    parts.forEach((part) => {
      accPath = accPath + '/' + part
      segments.push({ name: part, path: accPath })
    })
  }
  return segments
}