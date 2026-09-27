"""Scheduler service for managing scheduled tasks."""

import uuid
from datetime import datetime
from pathlib import Path

from croniter import croniter

from server.infrastructure.db import DATABASE_PATH
from server.infrastructure.repositories.scheduler_repository import SchedulerRepository
from server.models.scheduler import (
    ScheduledTask,
    ScheduledTaskCreate,
    ScheduledTaskUpdate,
)


class SchedulerService:
    """Service for managing scheduled scraping tasks."""

    def __init__(self, db_path: Path | None = None):
        """Initialize scheduler service."""
        self.db_path = db_path or DATABASE_PATH
        self._repo = SchedulerRepository(db_path)

    def _calculate_next_run(self, cron_expression: str) -> datetime | None:
        """Calculate next run time from cron expression."""
        try:
            cron = croniter(cron_expression, datetime.now())
            return cron.get_next(datetime)
        except (ValueError, KeyError):
            return None

    def _validate_cron(self, cron_expression: str) -> bool:
        """Validate cron expression."""
        try:
            croniter(cron_expression)
            return True
        except (ValueError, KeyError):
            return False

    async def create_task(self, task: ScheduledTaskCreate) -> ScheduledTask:
        """Create a new scheduled task."""
        task_id = str(uuid.uuid4())[:8]
        now = datetime.now()
        next_run = self._calculate_next_run(task.cron_expression) if task.enabled else None

        await self._repo.insert_task(
            task_id=task_id,
            name=task.name,
            folder_path=task.folder_path,
            cron_expression=task.cron_expression,
            enabled=1 if task.enabled else 0,
            next_run=next_run.isoformat() if next_run else None,
            created_at=now.isoformat(),
        )

        return ScheduledTask(
            id=task_id,
            name=task.name,
            folder_path=task.folder_path,
            cron_expression=task.cron_expression,
            enabled=task.enabled,
            next_run=next_run,
            created_at=now,
        )

    async def get_task(self, task_id: str) -> ScheduledTask | None:
        """Get a scheduled task by ID."""
        row = await self._repo.get_task(task_id)
        if row is None:
            return None

        return self._row_to_task(row)

    async def list_tasks(self) -> list[ScheduledTask]:
        """List all scheduled tasks."""
        rows = await self._repo.list_tasks()
        return [self._row_to_task(row) for row in rows]

    async def update_task(self, task_id: str, update: ScheduledTaskUpdate) -> ScheduledTask | None:
        """Update a scheduled task."""
        task = await self.get_task(task_id)
        if task is None:
            return None

        # Apply updates
        if update.name is not None:
            task.name = update.name
        if update.folder_path is not None:
            task.folder_path = update.folder_path
        if update.cron_expression is not None:
            task.cron_expression = update.cron_expression
        if update.enabled is not None:
            task.enabled = update.enabled

        # Recalculate next run
        next_run = self._calculate_next_run(task.cron_expression) if task.enabled else None

        await self._repo.update_task(
            task_id=task_id,
            name=task.name,
            folder_path=task.folder_path,
            cron_expression=task.cron_expression,
            enabled=1 if task.enabled else 0,
            next_run=next_run.isoformat() if next_run else None,
        )

        task.next_run = next_run
        return task

    async def delete_task(self, task_id: str) -> bool:
        """Delete a scheduled task."""
        return await self._repo.delete_task(task_id)

    async def toggle_task(self, task_id: str) -> ScheduledTask | None:
        """Toggle task enabled status."""
        task = await self.get_task(task_id)
        if task is None:
            return None

        return await self.update_task(task_id, ScheduledTaskUpdate(enabled=not task.enabled))

    def _row_to_task(self, row) -> ScheduledTask:
        """Convert database row to ScheduledTask."""
        return ScheduledTask(
            id=row["id"],
            name=row["name"],
            folder_path=row["folder_path"],
            cron_expression=row["cron_expression"],
            enabled=bool(row["enabled"]),
            last_run=datetime.fromisoformat(row["last_run"]) if row["last_run"] else None,
            next_run=datetime.fromisoformat(row["next_run"]) if row["next_run"] else None,
            created_at=datetime.fromisoformat(row["created_at"]) if row["created_at"] else None,
        )
