"""Extract collection release dates from media directory names."""

from __future__ import annotations

import re

_COLLECTION_PATTERNS = (
    re.compile(r"(?P<year>(?:19|20)\d{2})年\s*(?P<month>1[0-2]|0?[1-9])月"),
    re.compile(
        r"(?:TMDB[-_ ](?:CHS|TEST)[-_ ]?)?"
        r"(?P<year>(?:19|20)\d{2})(?:[-_ ](?P<month>1[0-2]|0?[1-9]))?",
        re.IGNORECASE,
    ),
)


def extract_collection_date(filepath: str | None) -> tuple[int | None, int | None]:
    """Return ``(year, month)`` from parent folders, if present."""
    if not filepath:
        return None, None

    normalized = filepath.replace("\\", "/")
    parent = normalized.rsplit("/", 1)[0] if "/" in normalized else ""
    for pattern in _COLLECTION_PATTERNS:
        matches = list(pattern.finditer(parent))
        if not matches:
            continue
        match = matches[-1]
        year = int(match.group("year"))
        month_text = match.groupdict().get("month")
        return year, int(month_text) if month_text else None
    return None, None
