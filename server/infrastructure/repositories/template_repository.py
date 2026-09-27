"""命名模板读取仓储 - 同步 sqlite3 实现（兼容既有同步调用面）。"""

from __future__ import annotations

import sqlite3
from pathlib import Path


class TemplateRepository:
    """从 config 表读取配置原始值（同步）。"""

    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path

    def get_config_value(self, key: str) -> str | None:
        """读取配置值；库文件或表不可用时返回 None。"""
        if not self._db_path.exists():
            return None

        db = None
        try:
            db = sqlite3.connect(self._db_path)
            cursor = db.execute(
                "SELECT value FROM config WHERE key = ?",
                (key,),
            )
            row = cursor.fetchone()
        except sqlite3.Error:
            return None
        finally:
            if db is not None:
                db.close()

        if row is None or not row[0]:
            return None
        return row[0]
