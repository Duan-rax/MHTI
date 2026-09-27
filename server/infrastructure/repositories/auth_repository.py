"""admin 与 login_attempts 表仓储。

连接通过 manager_getter 获取：调用方（服务模块）注入可替换的取值函数，
使测试对模块级 get_db_manager 符号的替换仍然生效。
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator, Awaitable, Callable

import aiosqlite

from server.infrastructure.db import get_db_manager


async def _default_manager_getter() -> Any:
    return await get_db_manager()


class AuthRepository:
    """认证相关表访问。"""

    def __init__(
        self,
        manager_getter: Callable[[], Awaitable[Any]] | None = None,
    ) -> None:
        self._manager_getter = manager_getter or _default_manager_getter

    @asynccontextmanager
    async def _connect(self) -> AsyncGenerator[aiosqlite.Connection, None]:
        manager = await self._manager_getter()
        async with manager.get_connection() as db:
            yield db

    async def count_admins(self) -> int:
        async with self._connect() as db:
            cursor = await db.execute("SELECT COUNT(*) FROM admin")
            row = await cursor.fetchone()
            return row[0] if row else 0

    async def insert_admin(self, username: str, password_hash: str) -> None:
        async with self._connect() as db:
            await db.execute(
                "INSERT INTO admin (username, password_hash) VALUES (?, ?)",
                (username, password_hash),
            )
            await db.commit()

    async def get_password_hash(self, username: str) -> str | None:
        async with self._connect() as db:
            cursor = await db.execute(
                "SELECT password_hash FROM admin WHERE username = ?", (username,)
            )
            row = await cursor.fetchone()
            return row[0] if row else None

    async def get_user_id(self, username: str) -> int | None:
        async with self._connect() as db:
            cursor = await db.execute(
                "SELECT id FROM admin WHERE username = ?", (username,)
            )
            row = await cursor.fetchone()
            return row[0] if row else None

    async def get_username_by_id(self, user_id: int) -> str | None:
        async with self._connect() as db:
            cursor = await db.execute(
                "SELECT username FROM admin WHERE id = ?", (user_id,)
            )
            row = await cursor.fetchone()
            return row[0] if row else None

    async def get_login_attempts(self, client_ip: str) -> aiosqlite.Row | None:
        async with self._connect() as db:
            cursor = await db.execute(
                "SELECT attempts, last_attempt FROM login_attempts WHERE client_ip = ?",
                (client_ip,),
            )
            return await cursor.fetchone()

    async def delete_login_attempts(self, client_ip: str) -> None:
        async with self._connect() as db:
            await db.execute(
                "DELETE FROM login_attempts WHERE client_ip = ?", (client_ip,)
            )
            await db.commit()

    async def record_failed_attempt(self, client_ip: str, now: str) -> int:
        """记录一次失败登录并返回当前累计次数。"""
        async with self._connect() as db:
            await db.execute("""
                INSERT INTO login_attempts (client_ip, attempts, last_attempt)
                VALUES (?, 1, ?)
                ON CONFLICT(client_ip) DO UPDATE SET
                    attempts = attempts + 1,
                    last_attempt = excluded.last_attempt
            """, (client_ip, now))
            await db.commit()

            cursor = await db.execute(
                "SELECT attempts FROM login_attempts WHERE client_ip = ?",
                (client_ip,),
            )
            row = await cursor.fetchone()
            return row[0] if row else 1

    async def update_password(self, username: str, password_hash: str) -> None:
        async with self._connect() as db:
            await db.execute(
                "UPDATE admin SET password_hash = ? WHERE username = ?",
                (password_hash, username),
            )
            await db.commit()

    async def username_exists_other(self, new_username: str, current_username: str) -> bool:
        async with self._connect() as db:
            cursor = await db.execute(
                "SELECT id FROM admin WHERE username = ? AND username != ?",
                (new_username, current_username),
            )
            return await cursor.fetchone() is not None

    async def update_username(self, new_username: str, current_username: str) -> None:
        async with self._connect() as db:
            await db.execute(
                "UPDATE admin SET username = ? WHERE username = ?",
                (new_username, current_username),
            )
            await db.commit()

    async def get_profile(self, username: str) -> aiosqlite.Row | None:
        async with self._connect() as db:
            cursor = await db.execute(
                "SELECT id, username, avatar, created_at FROM admin WHERE username = ?",
                (username,),
            )
            return await cursor.fetchone()

    async def update_avatar(self, username: str, avatar_data: str) -> None:
        async with self._connect() as db:
            await db.execute(
                "UPDATE admin SET avatar = ? WHERE username = ?",
                (avatar_data, username),
            )
            await db.commit()

    async def delete_avatar(self, username: str) -> None:
        async with self._connect() as db:
            await db.execute(
                "UPDATE admin SET avatar = NULL WHERE username = ?",
                (username,),
            )
            await db.commit()
