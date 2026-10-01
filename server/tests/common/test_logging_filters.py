"""Tests for credential redaction in framework logs."""

import logging

from server.common.logging_filters import SecretRedactionFilter, redact_log_value


def test_redact_log_value_masks_websocket_token():
    value = "WebSocket /ws?token=header.payload.signature&client=web [accepted]"

    assert redact_log_value(value) == "WebSocket /ws?token=<redacted>&client=web [accepted]"


def test_filter_masks_deferred_log_arguments():
    record = logging.LogRecord(
        name="uvicorn.error",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg='%s - "WebSocket %s" [accepted]',
        args=("127.0.0.1", "/ws?token=secret.jwt.value"),
        exc_info=None,
    )

    assert SecretRedactionFilter().filter(record)
    assert "secret.jwt.value" not in record.getMessage()
    assert "token=<redacted>" in record.getMessage()
