"""SQLite 仓储基类 - 统一连接获取。

默认走全局连接池（server.infrastructure.db）；显式传入 db_path（测试/独立库场景）
时直连该文件，并将连接行为对齐连接池（PRAGMA 配置 + Row 工厂）。
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import aiosqlite

from server.infrastructure.db import configure_connection, db_context


class BaseRepository:
    """SQLite 仓储基类。"""

    def __init__(self, db_path: Path | None = None) -> None:
        self._db_path = db_path
        self._schema_ready = False

    async def _ensure_custom_schema(self, db: aiosqlite.Connection) -> None:
        """自定义路径首次连接时建表；默认无表，由子类覆盖。"""

    @asynccontextmanager
    async def _connect(self) -> AsyncGenerator[aiosqlite.Connection, None]:
        if self._db_path is None:
            async with db_context() as db:
                yield db
            return

        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiosqlite.connect(self._db_path) as db:
            await configure_connection(db)
            db.row_factory = aiosqlite.Row
            if not self._schema_ready:
                await self._ensure_custom_schema(db)
                await db.commit()
                self._schema_ready = True
            yield db

    async def ensure_schema(self) -> None:
        """确保连接与自定义路径下的表结构就绪。"""
        async with self._connect():
            pass

    async def _fetch_one(self, sql: str, params: tuple = ()) -> aiosqlite.Row | None:
        async with self._connect() as db:
            cursor = await db.execute(sql, params)
            return await cursor.fetchone()

    async def _fetch_all(self, sql: str, params: tuple = ()) -> list[aiosqlite.Row]:
        async with self._connect() as db:
            cursor = await db.execute(sql, params)
            return list(await cursor.fetchall())

    async def _execute(self, sql: str, params: tuple = ()) -> int:
        async with self._connect() as db:
            cursor = await db.execute(sql, params)
            await db.commit()
            return cursor.rowcount
