"""数据访问层 - 仓储实现。"""

from server.infrastructure.repositories.auth_config_repository import AuthConfigRepository
from server.infrastructure.repositories.auth_repository import AuthRepository
from server.infrastructure.repositories.base import BaseRepository
from server.infrastructure.repositories.config_repository import ConfigRepository
from server.infrastructure.repositories.history_repository import HistoryRepository
from server.infrastructure.repositories.log_repository import LogRepository
from server.infrastructure.repositories.manual_job_repository import ManualJobRepository
from server.infrastructure.repositories.scheduler_repository import SchedulerRepository
from server.infrastructure.repositories.scrape_job_repository import ScrapeJobRepository
from server.infrastructure.repositories.scraped_file_repository import ScrapedFileRepository
from server.infrastructure.repositories.session_repository import SessionRepository
from server.infrastructure.repositories.template_repository import TemplateRepository
from server.infrastructure.repositories.watcher_repository import WatcherRepository

__all__ = [
    "AuthConfigRepository",
    "AuthRepository",
    "BaseRepository",
    "ConfigRepository",
    "HistoryRepository",
    "LogRepository",
    "ManualJobRepository",
    "SchedulerRepository",
    "ScrapeJobRepository",
    "ScrapedFileRepository",
    "SessionRepository",
    "TemplateRepository",
    "WatcherRepository",
]
