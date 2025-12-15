"""
Call Detail Records service.

This module provides the main service for fetching and processing
Microsoft Teams call records.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from eden_teams.cdr.models import (
    CallQuality,
    CallRecord,
    CallSession,
    CallType,
    Modality,
    Participant,
)
from eden_teams.graph.client import GraphClient

logger = logging.getLogger(__name__)


class CallRecordService:
    """
    Service for working with Microsoft Teams Call Detail Records.

    This class provides methods for fetching, filtering, and analyzing
    call records from Microsoft Graph API.
    """

    def __init__(self, graph_client: Optional[GraphClient] = None) -> None:
        """
        Initialize the Call Record Service.

        Args:
            graph_client: Optional GraphClient instance. Creates new one if not provided.
        """
        self._graph = graph_client or GraphClient()
        self._user_cache: Dict[str, Dict[str, Any]] = {}
        logger.info("CallRecordService initialized")

    def get_call_records(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: Optional[int] = None,
    ) -> List[CallRecord]:
        """
        Get call records within a date range.

        Args:
            start_date: Start of date range. Defaults to 7 days ago.
            end_date: End of date range. Defaults to now.
            limit: Maximum number of records to return.

        Returns:
            List of CallRecord objects.
        """
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=7)
        if end_date is None:
            end_date = datetime.utcnow()

        logger.info(
            "Fetching call records from %s to %s",
            start_date.isoformat(),
            end_date.isoformat(),
        )

        raw_records = self._graph.get_call_records(
            start_date=start_date,
            end_date=end_date,
            top=limit,
        )

        records = [self._parse_call_record(r) for r in raw_records]
        logger.info("Parsed %d call records", len(records))
        return records

    def get_call_record(self, call_id: str, include_sessions: bool = False) -> CallRecord:
        """
        Get a specific call record by ID.

        Args:
            call_id: The unique identifier of the call record.
            include_sessions: Whether to fetch session details.

        Returns:
            CallRecord object.
        """
        raw_record = self._graph.get_call_record(call_id)
        record = self._parse_call_record(raw_record)

        if include_sessions:
            raw_sessions = self._graph.get_call_record_sessions(call_id)
            record.sessions = [self._parse_session(s) for s in raw_sessions]

        return record

    def get_user_calls(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[CallRecord]:
        """
        Get call records for a specific user.

        Args:
            user_id: User ID or email address.
            start_date: Start of date range.
            end_date: End of date range.

        Returns:
            List of CallRecord objects involving the user.
        """
        all_records = self.get_call_records(start_date, end_date)

        # Filter records where user is a participant
        user_records = []
        for record in all_records:
            for participant in record.participants:
                if (
                    participant.user_id == user_id
                    or participant.email == user_id
                    or participant.display_name == user_id
                ):
                    user_records.append(record)
                    break

        logger.info("Found %d calls for user %s", len(user_records), user_id)
        return user_records

    def get_call_summary(self, records: List[CallRecord]) -> Dict[str, Any]:
        """
        Generate a summary of call records.

        Args:
            records: List of CallRecord objects to summarize.

        Returns:
            Dictionary with summary statistics.
        """
        if not records:
            return {
                "total_calls": 0,
                "total_duration_seconds": 0,
                "average_duration_seconds": 0,
                "call_types": {},
                "participant_count": 0,
            }

        total_duration = sum(
            r.duration_seconds or 0 for r in records
        )

        call_types: Dict[str, int] = {}
        for record in records:
            call_type = record.call_type.value
            call_types[call_type] = call_types.get(call_type, 0) + 1

        unique_participants = set()
        for record in records:
            for p in record.participants:
                unique_participants.add(p.identifier)

        return {
            "total_calls": len(records),
            "total_duration_seconds": total_duration,
            "average_duration_seconds": total_duration // len(records) if records else 0,
            "total_duration_formatted": self._format_duration(total_duration),
            "average_duration_formatted": self._format_duration(
                total_duration // len(records) if records else 0
            ),
            "call_types": call_types,
            "participant_count": len(unique_participants),
            "date_range": {
                "start": min(r.start_time for r in records).isoformat(),
                "end": max(r.start_time for r in records).isoformat(),
            },
        }

    def _parse_call_record(self, data: Dict[str, Any]) -> CallRecord:
        """Parse raw API data into a CallRecord model."""
        return CallRecord(
            id=data.get("id", ""),
            call_type=self._parse_call_type(data.get("type")),
            start_time=self._parse_datetime(data.get("startDateTime")),
            end_time=self._parse_datetime(data.get("endDateTime")),
            organizer=self._parse_participant(data.get("organizer")),
            participants=[
                self._parse_participant(p)
                for p in data.get("participants", [])
            ],
            modalities=[
                self._parse_modality(m)
                for m in data.get("modalities", [])
            ],
            version=data.get("version", 1),
            join_web_url=data.get("joinWebUrl"),
        )

    def _parse_session(self, data: Dict[str, Any]) -> CallSession:
        """Parse raw API data into a CallSession model."""
        return CallSession(
            id=data.get("id", ""),
            caller=self._parse_participant(data.get("caller")),
            callee=self._parse_participant(data.get("callee")),
            start_time=self._parse_datetime(data.get("startDateTime")),
            end_time=self._parse_datetime(data.get("endDateTime")),
            modalities=[
                self._parse_modality(m)
                for m in data.get("modalities", [])
            ],
            failure_info=data.get("failureInfo", {}).get("reason"),
        )

    def _parse_participant(self, data: Optional[Dict[str, Any]]) -> Optional[Participant]:
        """Parse raw API data into a Participant model."""
        if not data:
            return None

        identity = data.get("identity", {})
        user = identity.get("user", {})

        return Participant(
            id=user.get("id"),
            display_name=user.get("displayName"),
            user_id=user.get("id"),
            email=identity.get("userPrincipalName"),
            phone_number=identity.get("phone", {}).get("id"),
        )

    def _parse_call_type(self, value: Optional[str]) -> CallType:
        """Parse call type string to enum."""
        if not value:
            return CallType.UNKNOWN
        try:
            return CallType(value)
        except ValueError:
            return CallType.UNKNOWN

    def _parse_modality(self, value: Optional[str]) -> Modality:
        """Parse modality string to enum."""
        if not value:
            return Modality.UNKNOWN
        try:
            return Modality(value)
        except ValueError:
            return Modality.UNKNOWN

    @staticmethod
    def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
        """Parse ISO datetime string."""
        if not value:
            return None
        try:
            # Handle both formats with and without Z suffix
            value = value.rstrip("Z")
            return datetime.fromisoformat(value)
        except ValueError:
            return None

    @staticmethod
    def _format_duration(seconds: int) -> str:
        """Format seconds as human-readable duration."""
        hours, remainder = divmod(seconds, 3600)
        minutes, secs = divmod(remainder, 60)

        if hours:
            return f"{hours}h {minutes}m {secs}s"
        elif minutes:
            return f"{minutes}m {secs}s"
        else:
            return f"{secs}s"
