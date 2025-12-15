"""
Pytest configuration and fixtures.
"""

from datetime import datetime, timedelta

import pytest


@pytest.fixture
def sample_call_record_data() -> dict:
    """Provide sample call record data for testing."""
    return {
        "id": "call-123",
        "type": "peerToPeer",
        "startDateTime": "2024-01-15T10:00:00Z",
        "endDateTime": "2024-01-15T10:30:00Z",
        "organizer": {
            "identity": {
                "user": {
                    "id": "user-1",
                    "displayName": "John Smith",
                },
                "userPrincipalName": "john@company.com",
            }
        },
        "participants": [
            {
                "identity": {
                    "user": {
                        "id": "user-1",
                        "displayName": "John Smith",
                    },
                    "userPrincipalName": "john@company.com",
                }
            },
            {
                "identity": {
                    "user": {
                        "id": "user-2",
                        "displayName": "Jane Doe",
                    },
                    "userPrincipalName": "jane@company.com",
                }
            },
        ],
        "modalities": ["audio", "video"],
    }


@pytest.fixture
def sample_session_data() -> dict:
    """Provide sample session data for testing."""
    return {
        "id": "session-456",
        "startDateTime": "2024-01-15T10:00:00Z",
        "endDateTime": "2024-01-15T10:30:00Z",
        "caller": {
            "identity": {
                "user": {
                    "id": "user-1",
                    "displayName": "John Smith",
                }
            }
        },
        "callee": {
            "identity": {
                "user": {
                    "id": "user-2",
                    "displayName": "Jane Doe",
                }
            }
        },
        "modalities": ["audio"],
    }


@pytest.fixture
def mock_graph_response() -> list:
    """Provide mock Graph API response for call records."""
    return [
        {
            "id": "call-1",
            "type": "peerToPeer",
            "startDateTime": "2024-01-15T10:00:00Z",
            "endDateTime": "2024-01-15T10:15:00Z",
            "participants": [],
            "modalities": ["audio"],
        },
        {
            "id": "call-2",
            "type": "groupCall",
            "startDateTime": "2024-01-15T14:00:00Z",
            "endDateTime": "2024-01-15T15:00:00Z",
            "participants": [],
            "modalities": ["audio", "video"],
        },
    ]
