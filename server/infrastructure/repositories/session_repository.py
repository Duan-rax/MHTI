"""sessions 与 login_history 表仓储。"""

from __future__ import annotations

import aiosqlite

from server.infrastructure.repositories.base import BaseRepository


class SessionRepository(BaseRepository):
    """会话与登录历史表访问。"""

    # ---- sessions ----

    async def insert_session(
        self,
        *,
        session_id: str,
        user_id: int,
        refresh_token_hash: str,
        device_name: str | None,
        device_type: str,
        ip_address: str | None,
        user_agent: str | None,
        expires_at: str,
    ) -> None:
        async with self._connect() as db:
            await db.execute(
                """
                INSERT INTO sessions
                (id, user_id, refresh_token_hash, device_name, device_type,
                 ip_address, user_agent, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    user_id,
                    refresh_token_hash,
                    device_name,
                    device_type,
                    ip_address,
                    user_agent,
                    expires_at,
                ),
            )
            await db.commit()

    async def count_sessions(self, user_id: int) -> int:
        row = await self._fetch_one(
            "SELECT COUNT(*) FROM sessions WHERE user_id = ?", (user_id,)
        )
        return row[0] if row else 0

    async def delete_oldest_sessions(self, user_id: int, limit: int) -> None:
        await self._execute(
            """
            DELETE FROM sessions WHERE id IN (
                SELECT id FROM sessions
                WHERE user_id = ?
                ORDER BY last_used_at ASC
                LIMIT ?
            )
            """,
            (user_id, limit),
        )

    async def find_by_token(self, token_hash: str) -> aiosqlite.Row | None:
        """按 refresh token 哈希查会话（id, user_id, expires_at）。"""
        return await self._fetch_one(
            "SELECT id, user_id, expires_at FROM sessions WHERE refresh_token_hash = ?",
            (token_hash,),
        )

    async def find_valid_by_token(self, token_hash: str, now: str) -> aiosqlite.Row | None:
        return await self._fetch_one(
            """
            SELECT id, user_id FROM sessions
            WHERE refresh_token_hash = ? AND expires_at > ?
            """,
            (token_hash, now),
        )

    async def touch_session(self, session_id: str, now: str) -> None:
        await self._execute(
            "UPDATE sessions SET last_used_at = ? WHERE id = ?",
            (now, session_id),
        )

    async def delete_session(self, session_id: str) -> bool:
        return await self._execute(
            "DELETE FROM sessions WHERE id = ?", (session_id,)
        ) > 0

    async def delete_user_sessions(
        self, user_id: int, except_session_id: str | None = None
    ) -> int:
        if except_session_id:
            return await self._execute(
                "DELETE FROM sessions WHERE user_id = ? AND id != ?",
                (user_id, except_session_id),
            )
        return await self._execute(
            "DELETE FROM sessions WHERE user_id = ?", (user_id,)
        )

    async def delete_expired(self, now: str) -> None:
        await self._execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))

    async def list_user_sessions(self, user_id: int) -> list[aiosqlite.Row]:
        return await self._fetch_all(
            """
            SELECT id, device_name, device_type, ip_address,
                   created_at, last_used_at, expires_at, user_agent
            FROM sessions
            WHERE user_id = ?
            ORDER BY last_used_at DESC
            """,
            (user_id,),
        )

    # ---- login_history ----

    async def insert_login_history(
        self,
        *,
        username: str,
        ip_address: str | None,
        user_agent: str | None,
        device_name: str | None,
        success: int,
        failure_reason: str | None,
        session_id: str | None,
    ) -> None:
        async with self._connect() as db:
            await db.execute(
                """
                INSERT INTO login_history
                (username, ip_address, user_agent, device_name, success, failure_reason, session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    username,
                    ip_address,
                    user_agent,
                    device_name,
                    success,
                    failure_reason,
                    session_id,
                ),
            )
            await db.commit()

    async def count_login_history(self, username: str) -> int:
        row = await self._fetch_one(
            "SELECT COUNT(*) FROM login_history WHERE username = ?", (username,)
        )
        return row[0] if row else 0

    async def list_login_history(
        self, username: str, limit: int, offset: int
    ) -> list[aiosqlite.Row]:
        return await self._fetch_all(
            """
            SELECT id, ip_address, user_agent, device_name, login_time, success, failure_reason
            FROM login_history
            WHERE username = ?
            ORDER BY login_time DESC
            LIMIT ? OFFSET ?
            """,
            (username, limit, offset),
        )

    async def delete_old_history(self, cutoff: str) -> int:
        return await self._execute(
            "DELETE FROM login_history WHERE login_time < ?",
            (cutoff,),
        )
