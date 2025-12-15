"""
Tests for CDR models.
"""

from datetime import datetime, timedelta

from eden_teams.cdr.models import (
    CallQuality,
    CallRecord,
    CallSession,
    CallType,
    Modality,
    Participant,
)


class TestParticipant:
    """Tests for Participant model."""

    def test_participant_creation(self) -> None:
        """Test creating a participant."""
        participant = Participant(
            id="user-123",
            display_name="John Smith",
            email="john@company.com",
            user_id="user-123",
        )
        assert participant.display_name == "John Smith"
        assert participant.email == "john@company.com"

    def test_participant_identifier_email(self) -> None:
        """Test identifier property with email."""
        participant = Participant(
            display_name="John Smith",
            email="john@company.com",
        )
        assert participant.identifier == "john@company.com"

    def test_participant_identifier_display_name(self) -> None:
        """Test identifier property with display name only."""
        participant = Participant(display_name="John Smith")
        assert participant.identifier == "John Smith"

    def test_participant_identifier_unknown(self) -> None:
        """Test identifier property with no info."""
        participant = Participant()
        assert participant.identifier == "Unknown"


class TestCallRecord:
    """Tests for CallRecord model."""

    def test_call_record_creation(self) -> None:
        """Test creating a call record."""
        record = CallRecord(
            id="call-123",
            call_type=CallType.PEER_TO_PEER,
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            end_time=datetime(2024, 1, 15, 10, 30, 0),
        )
        assert record.id == "call-123"
        assert record.call_type == CallType.PEER_TO_PEER
        assert record.is_peer_to_peer is True
        assert record.is_meeting is False

    def test_call_record_duration(self) -> None:
        """Test duration calculation."""
        record = CallRecord(
            id="call-123",
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            end_time=datetime(2024, 1, 15, 10, 30, 0),
        )
        assert record.duration == timedelta(minutes=30)
        assert record.duration_seconds == 1800

    def test_call_record_duration_formatted(self) -> None:
        """Test formatted duration string."""
        record = CallRecord(
            id="call-123",
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            end_time=datetime(2024, 1, 15, 11, 30, 45),
        )
        assert record.duration_formatted == "1h 30m 45s"

    def test_call_record_participant_count(self) -> None:
        """Test participant count."""
        participants = [
            Participant(display_name="User 1"),
            Participant(display_name="User 2"),
            Participant(display_name="User 3"),
        ]
        record = CallRecord(
            id="call-123",
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            participants=participants,
        )
        assert record.participant_count == 3

    def test_call_record_get_participant_names(self) -> None:
        """Test getting participant names."""
        participants = [
            Participant(email="user1@company.com"),
            Participant(display_name="User 2"),
        ]
        record = CallRecord(
            id="call-123",
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            participants=participants,
        )
        names = record.get_participant_names()
        assert "user1@company.com" in names
        assert "User 2" in names

    def test_call_record_summary(self) -> None:
        """Test summary generation."""
        record = CallRecord(
            id="call-123",
            call_type=CallType.MEETING,
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            end_time=datetime(2024, 1, 15, 10, 30, 0),
            participants=[Participant(display_name="User 1")],
        )
        summary = record.to_summary()
        assert "call-123" in summary
        assert "meeting" in summary
        assert "30m" in summary


class TestCallQuality:
    """Tests for CallQuality model."""

    def test_good_quality(self) -> None:
        """Test good quality detection."""
        quality = CallQuality(
            average_packet_loss_rate=0.01,
            average_jitter=timedelta(milliseconds=10),
        )
        assert quality.is_good_quality is True

    def test_poor_quality_packet_loss(self) -> None:
        """Test poor quality due to packet loss."""
        quality = CallQuality(average_packet_loss_rate=0.10)
        assert quality.is_good_quality is False

    def test_poor_quality_jitter(self) -> None:
        """Test poor quality due to jitter."""
        quality = CallQuality(average_jitter=timedelta(milliseconds=50))
        assert quality.is_good_quality is False


class TestCallSession:
    """Tests for CallSession model."""

    def test_session_duration(self) -> None:
        """Test session duration calculation."""
        session = CallSession(
            id="session-123",
            start_time=datetime(2024, 1, 15, 10, 0, 0),
            end_time=datetime(2024, 1, 15, 10, 15, 0),
        )
        assert session.duration == timedelta(minutes=15)
        assert session.duration_seconds == 900

    def test_session_no_duration(self) -> None:
        """Test session with no end time."""
        session = CallSession(
            id="session-123",
            start_time=datetime(2024, 1, 15, 10, 0, 0),
        )
        assert session.duration is None
        assert session.duration_seconds is None
