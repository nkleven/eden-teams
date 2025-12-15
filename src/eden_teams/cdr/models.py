"""
Data models for Call Detail Records.

This module defines Pydantic models for representing Microsoft Teams
call records, sessions, participants, and quality metrics.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class CallType(str, Enum):
    """Types of Teams calls."""

    UNKNOWN = "unknown"
    GROUP_CALL = "groupCall"
    PEER_TO_PEER = "peerToPeer"
    MEETING = "meeting"


class Modality(str, Enum):
    """Communication modalities in a call."""

    AUDIO = "audio"
    VIDEO = "video"
    VIDEO_BASED_SCREEN_SHARING = "videoBasedScreenSharing"
    DATA = "data"
    SCREEN_SHARING = "screenSharing"
    UNKNOWN = "unknown"


class CallQuality(BaseModel):
    """Quality metrics for a call or session."""

    average_audio_degradation: Optional[float] = Field(
        default=None, description="Average audio degradation score"
    )
    average_jitter: Optional[timedelta] = Field(
        default=None, description="Average jitter in milliseconds"
    )
    average_packet_loss_rate: Optional[float] = Field(
        default=None, description="Average packet loss rate (0-1)"
    )
    average_round_trip_time: Optional[timedelta] = Field(
        default=None, description="Average round trip time"
    )
    average_video_frame_rate: Optional[float] = Field(
        default=None, description="Average video frame rate"
    )
    jitter_max: Optional[timedelta] = Field(
        default=None, description="Maximum jitter observed"
    )
    packet_loss_max: Optional[float] = Field(
        default=None, description="Maximum packet loss rate observed"
    )

    @property
    def is_good_quality(self) -> bool:
        """Check if call quality metrics indicate a good call."""
        if self.average_packet_loss_rate and self.average_packet_loss_rate > 0.05:
            return False
        if self.average_jitter and self.average_jitter > timedelta(milliseconds=30):
            return False
        return True


class Participant(BaseModel):
    """A participant in a Teams call."""

    id: Optional[str] = Field(default=None, description="Unique identifier")
    display_name: Optional[str] = Field(default=None, description="Display name")
    email: Optional[str] = Field(default=None, description="Email address")
    user_id: Optional[str] = Field(default=None, description="Azure AD user ID")
    phone_number: Optional[str] = Field(
        default=None, description="Phone number if PSTN"
    )
    is_organizer: bool = Field(
        default=False, description="Whether participant organized the call"
    )

    @property
    def identifier(self) -> str:
        """Get the best available identifier for this participant."""
        return self.email or self.display_name or self.user_id or self.id or "Unknown"


class CallSession(BaseModel):
    """A session within a call (represents a call leg)."""

    id: str = Field(description="Unique session identifier")
    caller: Optional[Participant] = Field(
        default=None, description="Caller participant"
    )
    callee: Optional[Participant] = Field(
        default=None, description="Callee participant"
    )
    start_time: Optional[datetime] = Field(
        default=None, description="Session start time"
    )
    end_time: Optional[datetime] = Field(default=None, description="Session end time")
    modalities: List[Modality] = Field(
        default_factory=list, description="Communication modalities used"
    )
    quality: Optional[CallQuality] = Field(
        default=None, description="Quality metrics for this session"
    )
    failure_info: Optional[str] = Field(
        default=None, description="Failure information if call failed"
    )

    @property
    def duration(self) -> Optional[timedelta]:
        """Calculate session duration."""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None

    @property
    def duration_seconds(self) -> Optional[int]:
        """Get duration in seconds."""
        duration = self.duration
        return int(duration.total_seconds()) if duration else None


class CallRecord(BaseModel):
    """A Microsoft Teams call record."""

    id: str = Field(description="Unique call record identifier")
    call_type: CallType = Field(default=CallType.UNKNOWN, description="Type of call")
    start_time: datetime = Field(description="Call start time")
    end_time: Optional[datetime] = Field(default=None, description="Call end time")
    organizer: Optional[Participant] = Field(default=None, description="Call organizer")
    participants: List[Participant] = Field(
        default_factory=list, description="All participants"
    )
    sessions: List[CallSession] = Field(
        default_factory=list, description="Call sessions/legs"
    )
    modalities: List[Modality] = Field(
        default_factory=list, description="Modalities used in call"
    )
    version: int = Field(default=1, description="Record version")
    join_web_url: Optional[str] = Field(
        default=None, description="Web URL to join meeting"
    )

    @property
    def duration(self) -> Optional[timedelta]:
        """Calculate call duration."""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None

    @property
    def duration_seconds(self) -> Optional[int]:
        """Get duration in seconds."""
        duration = self.duration
        return int(duration.total_seconds()) if duration else None

    @property
    def duration_formatted(self) -> str:
        """Get human-readable duration string."""
        duration = self.duration
        if not duration:
            return "Unknown"

        total_seconds = int(duration.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        if hours:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"

    @property
    def participant_count(self) -> int:
        """Get number of participants."""
        return len(self.participants)

    @property
    def is_meeting(self) -> bool:
        """Check if this is a meeting call."""
        return self.call_type == CallType.MEETING

    @property
    def is_peer_to_peer(self) -> bool:
        """Check if this is a peer-to-peer call."""
        return self.call_type == CallType.PEER_TO_PEER

    def get_participant_names(self) -> List[str]:
        """Get list of participant names."""
        return [p.identifier for p in self.participants]

    def to_summary(self) -> str:
        """Generate a text summary of the call."""
        lines = [
            f"Call ID: {self.id}",
            f"Type: {self.call_type.value}",
            f"Start: {self.start_time.isoformat()}",
            f"Duration: {self.duration_formatted}",
            f"Participants ({self.participant_count}): {', '.join(self.get_participant_names())}",
        ]
        if self.organizer:
            lines.insert(2, f"Organizer: {self.organizer.identifier}")

        return "\n".join(lines)
