"""
Tests for CDR service.
"""

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

from eden_teams.cdr.models import CallRecord, CallType
from eden_teams.cdr.service import CallRecordService


class TestCallRecordService:
    """Tests for CallRecordService class."""

    def test_parse_call_type(self) -> None:
        """Test call type parsing."""
        service = CallRecordService.__new__(CallRecordService)
        assert service._parse_call_type("peerToPeer") == CallType.PEER_TO_PEER
        assert service._parse_call_type("groupCall") == CallType.GROUP_CALL
        assert service._parse_call_type("meeting") == CallType.MEETING
        assert service._parse_call_type("unknown_type") == CallType.UNKNOWN
        assert service._parse_call_type(None) == CallType.UNKNOWN

    def test_parse_datetime(self) -> None:
        """Test datetime parsing."""
        result = CallRecordService._parse_datetime("2024-01-15T10:00:00Z")
        assert result == datetime(2024, 1, 15, 10, 0, 0)

    def test_parse_datetime_none(self) -> None:
        """Test datetime parsing with None."""
        result = CallRecordService._parse_datetime(None)
        assert result is None

    def test_format_duration_seconds(self) -> None:
        """Test duration formatting for seconds."""
        result = CallRecordService._format_duration(45)
        assert result == "45s"

    def test_format_duration_minutes(self) -> None:
        """Test duration formatting for minutes."""
        result = CallRecordService._format_duration(150)
        assert result == "2m 30s"

    def test_format_duration_hours(self) -> None:
        """Test duration formatting for hours."""
        result = CallRecordService._format_duration(3725)
        assert result == "1h 2m 5s"

    def test_get_call_summary_empty(self) -> None:
        """Test summary generation with no records."""
        service = CallRecordService.__new__(CallRecordService)
        summary = service.get_call_summary([])
        assert summary["total_calls"] == 0
        assert summary["total_duration_seconds"] == 0

    def test_get_call_summary_with_records(self) -> None:
        """Test summary generation with records."""
        service = CallRecordService.__new__(CallRecordService)
        records = [
            CallRecord(
                id="call-1",
                call_type=CallType.PEER_TO_PEER,
                start_time=datetime(2024, 1, 15, 10, 0, 0),
                end_time=datetime(2024, 1, 15, 10, 30, 0),
            ),
            CallRecord(
                id="call-2",
                call_type=CallType.MEETING,
                start_time=datetime(2024, 1, 15, 14, 0, 0),
                end_time=datetime(2024, 1, 15, 15, 0, 0),
            ),
        ]
        summary = service.get_call_summary(records)
        assert summary["total_calls"] == 2
        assert summary["total_duration_seconds"] == 5400  # 30min + 60min
        assert summary["call_types"]["peerToPeer"] == 1
        assert summary["call_types"]["meeting"] == 1
