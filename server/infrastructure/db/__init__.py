"""Database module - centralized database management.

This module provides:
- Connection pool management
- Centralized table schema definitions
- Database initialization and cleanup

Usage:
    from server.infrastructure.db import get_db, init_database, close_database, DATABASE_PATH
    from server.infrastructure.db import db_context
"""

from server.infrastructure.db.connection import (
    DATABASE_PATH,
    DatabaseManager,
    close_database,
    configure_connection,
    db_context,
    get_db,
    get_db_manager,
    init_database,
)
from server.infrastructure.db.schema import create_all_tables

__all__ = [
    "DATABASE_PATH",
    "DatabaseManager",
    "close_database",
    "configure_connection",
    "create_all_tables",
    "db_context",
    "get_db",
    "get_db_manager",
    "init_database",
]
