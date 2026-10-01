"""Logging filters for removing credentials from framework access logs."""

from __future__ import annotations

import logging
import re

_TOKEN_QUERY_RE = re.compile(r"(?i)([?&]token=)[^&\s\"']+")


def redact_log_value(value):
    """Redact token query parameters while preserving logging placeholders."""
    if isinstance(value, str):
        return _TOKEN_QUERY_RE.sub(r"\1<redacted>", value)
    if isinstance(value, tuple):
        return tuple(redact_log_value(item) for item in value)
    if isinstance(value, dict):
        return {key: redact_log_value(item) for key, item in value.items()}
    return value


class SecretRedactionFilter(logging.Filter):
    """Sanitize log messages and deferred formatting arguments in place."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = redact_log_value(record.msg)
        record.args = redact_log_value(record.args)
        return True


def install_secret_redaction_filter() -> None:
    """Install redaction on application and uvicorn loggers/handlers."""
    redaction_filter = SecretRedactionFilter()
    for logger_name in ("", "uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        logger.addFilter(redaction_filter)
        for handler in logger.handlers:
            handler.addFilter(redaction_filter)
