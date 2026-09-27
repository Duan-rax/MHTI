"""scheduled_tasks 表仓储。"""

from __future__ import annotations

import aiosqlite

from server.infrastructure.repositories.base import BaseRepository


class SchedulerRepository(BaseRepository):
    """定时任务表访问。"""

    async def insert_task(
        self,
        *,
        task_id: str,
        name: str,
        folder_path: str,
        cron_expression: str,
        enabled: bool,
        next_run: str | None,
        created_at: str,
    ) -> None:
        async with self._connect() as db:
            await db.execute(
                """
                INSERT INTO scheduled_tasks
                    (id, name, folder_path, cron_expression, enabled, next_run, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (task_id, name, folder_path, cron_expression, enabled, next_run, created_at),
            )
            await db.commit()

    async def get_task(self, task_id: str) -> aiosqlite.Row | None:
        return await self._fetch_one(
            "SELECT * FROM scheduled_tasks WHERE id = ?", (task_id,)
        )

    async def list_tasks(self) -> list[aiosqlite.Row]:
        return await self._fetch_all(
            "SELECT * FROM scheduled_tasks ORDER BY created_at DESC"
        )

    async def update_task(
        self,
        *,
        task_id: str,
        name: str,
        folder_path: str,
        cron_expression: str,
        enabled: bool,
        next_run: str | None,
    ) -> None:
        async with self._connect() as db:
            await db.execute(
                """
                UPDATE scheduled_tasks
                SET name = ?, folder_path = ?, cron_expression = ?, enabled = ?, next_run = ?
                WHERE id = ?
                """,
                (name, folder_path, cron_expression, enabled, next_run, task_id),
            )
            await db.commit()

    async def delete_task(self, task_id: str) -> bool:
        return await self._execute(
            "DELETE FROM scheduled_tasks WHERE id = ?", (task_id,)
        ) > 0
