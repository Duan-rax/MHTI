"""logs 与 log_config 表仓储。"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import aiosqlite

from server.infrastructure.repositories.base import BaseRepository
from server.models.log import LogConfig, LogLevel, LogQuery


class LogRepository(BaseRepository):
    """应用日志与日志配置表访问。"""

    async def insert_batch(self, rows: list[tuple]) -> None:
        async with self._connect() as db:
            await db.executemany(
                """
                INSERT INTO logs (timestamp, level, logger, message, extra_data, request_id, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                rows,
            )
            await db.commit()

    async def query_logs(self, query: LogQuery) -> tuple[list[aiosqlite.Row], int]:
        conditions = []
        params: list[Any] = []

        if query.level:
            conditions.append("level = ?")
            params.append(query.level.value)

        if query.logger:
            conditions.append("logger LIKE ?")
            params.append(f"%{query.logger}%")

        if query.start_time:
            conditions.append("timestamp >= ?")
            params.append(query.start_time.isoformat())

        if query.end_time:
            conditions.append("timestamp <= ?")
            params.append(query.end_time.isoformat())

        if query.search:
            conditions.append("message LIKE ?")
            params.append(f"%{query.search}%")

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        async with self._connect() as db:
            # 查询总数
            cursor = await db.execute(
                f"SELECT COUNT(*) FROM logs WHERE {where_clause}", params
            )
            row = await cursor.fetchone()
            total = row[0] if row else 0

            # 查询数据
            cursor = await db.execute(
                f"""
                SELECT id, timestamp, level, logger, message, extra_data, request_id, user_id
                FROM logs
                WHERE {where_clause}
                ORDER BY timestamp DESC
                LIMIT ? OFFSET ?
                """,
                params + [query.limit, query.offset],
            )
            rows = await cursor.fetchall()

        return list(rows), total

    async def get_stats_rows(self) -> dict[str, Any]:
        """统计原始数据：总数/按级别/按模块(前20)/时间范围。"""
        async with self._connect() as db:
            cursor = await db.execute("SELECT COUNT(*) FROM logs")
            row = await cursor.fetchone()
            total = row[0] if row else 0

            cursor = await db.execute("SELECT level, COUNT(*) FROM logs GROUP BY level")
            by_level_rows = await cursor.fetchall()

            cursor = await db.execute(
                "SELECT logger, COUNT(*) as cnt FROM logs GROUP BY logger ORDER BY cnt DESC LIMIT 20"
            )
            by_logger_rows = await cursor.fetchall()

            cursor = await db.execute("SELECT MIN(timestamp), MAX(timestamp) FROM logs")
            bounds = await cursor.fetchone()

        return {
            "total": total,
            "by_level_rows": by_level_rows,
            "by_logger_rows": by_logger_rows,
            "bounds": bounds,
        }

    async def get_config_row(self) -> aiosqlite.Row | None:
        return await self._fetch_one(
            """
            SELECT log_level, console_enabled, file_enabled, db_enabled,
                   max_file_size_mb, max_file_count, db_retention_days, realtime_enabled
            FROM log_config WHERE id = 1
            """
        )

    async def update_config_row(self, config: LogConfig) -> None:
        async with self._connect() as db:
            await db.execute(
                """
                UPDATE log_config SET
                    log_level = ?,
                    console_enabled = ?,
                    file_enabled = ?,
                    db_enabled = ?,
                    max_file_size_mb = ?,
                    max_file_count = ?,
                    db_retention_days = ?,
                    realtime_enabled = ?
                WHERE id = 1
                """,
                (
                    config.log_level.value,
                    1 if config.console_enabled else 0,
                    1 if config.file_enabled else 0,
                    1 if config.db_enabled else 0,
                    config.max_file_size_mb,
                    config.max_file_count,
                    config.db_retention_days,
                    1 if config.realtime_enabled else 0,
                ),
            )
            await db.commit()

    async def delete_logs(
        self,
        before: datetime | None = None,
        level: LogLevel | None = None,
    ) -> int:
        conditions = []
        params: list[Any] = []

        if before:
            conditions.append("timestamp < ?")
            params.append(before.isoformat())

        if level:
            conditions.append("level = ?")
            params.append(level.value)

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        return await self._execute(f"DELETE FROM logs WHERE {where_clause}", tuple(params))

    async def list_loggers(self) -> list[str]:
        rows = await self._fetch_all("SELECT DISTINCT logger FROM logs ORDER BY logger")
        return [row[0] for row in rows]
