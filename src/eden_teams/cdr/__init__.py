"""
Call Detail Records (CDR) module for Eden Teams.

This package provides models and services for working with
Microsoft Teams call records.
"""

from eden_teams.cdr.models import CallQuality, CallRecord, CallSession, Participant
from eden_teams.cdr.service import CallRecordService

__all__ = [
    "CallRecord",
    "CallSession",
    "Participant",
    "CallQuality",
    "CallRecordService",
]
