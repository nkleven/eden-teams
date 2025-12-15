"""
Tests for the Graph API client module.
"""

from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
import respx
from httpx import Response

from eden_teams.graph.client import GraphClient


class TestGraphClient:
    """Tests for GraphClient class."""

    def test_client_initialization(self) -> None:
        """Test Graph client can be initialized."""
        client = GraphClient()
        assert client.BASE_URL == "https://graph.microsoft.com"
        assert client._http_client is None

    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_headers(self, mock_auth_provider: MagicMock) -> None:
        """Test getting authentication headers."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token-123"
        mock_auth_provider.return_value = mock_auth

        client = GraphClient()
        headers = client._get_headers()

        assert headers["Authorization"] == "Bearer test-token-123"
        assert headers["Content-Type"] == "application/json"

    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_headers_no_token(self, mock_auth_provider: MagicMock) -> None:
        """Test getting headers when token is None."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = None
        mock_auth_provider.return_value = mock_auth

        client = GraphClient()

        with pytest.raises(RuntimeError, match="Failed to get authentication token"):
            client._get_headers()

    @respx.mock
    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_call_records(self, mock_auth_provider: MagicMock) -> None:
        """Test fetching call records."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token"
        mock_auth_provider.return_value = mock_auth

        # Mock the HTTP response
        mock_data = {
            "value": [
                {
                    "id": "call-1",
                    "type": "meeting",
                    "startDateTime": "2024-01-15T10:00:00Z",
                },
                {
                    "id": "call-2",
                    "type": "peerToPeer",
                    "startDateTime": "2024-01-15T14:00:00Z",
                },
            ]
        }

        route = respx.get(
            "https://graph.microsoft.com/v1.0/communications/callRecords"
        ).mock(return_value=Response(200, json=mock_data))

        client = GraphClient()
        records = client.get_call_records()

        assert len(records) == 2
        assert records[0]["id"] == "call-1"
        assert records[1]["id"] == "call-2"
        assert route.called

    @respx.mock
    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_call_records_with_filters(self, mock_auth_provider: MagicMock) -> None:
        """Test fetching call records with date filters."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token"
        mock_auth_provider.return_value = mock_auth

        mock_data = {"value": []}

        route = respx.get(
            "https://graph.microsoft.com/v1.0/communications/callRecords"
        ).mock(return_value=Response(200, json=mock_data))

        client = GraphClient()
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)

        records = client.get_call_records(start_date=start_date, end_date=end_date)

        assert len(records) == 0
        assert route.called

        # Check that filters were applied
        request = route.calls[0].request
        url_str = str(request.url)
        # URL encoding converts $ to %24
        assert "%24filter" in url_str or "$filter" in url_str

    @respx.mock
    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_call_record(self, mock_auth_provider: MagicMock) -> None:
        """Test fetching a specific call record."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token"
        mock_auth_provider.return_value = mock_auth

        call_id = "test-call-123"
        mock_data = {
            "id": call_id,
            "type": "meeting",
            "startDateTime": "2024-01-15T10:00:00Z",
        }

        route = respx.get(
            f"https://graph.microsoft.com/v1.0/communications/callRecords/{call_id}"
        ).mock(return_value=Response(200, json=mock_data))

        client = GraphClient()
        record = client.get_call_record(call_id)

        assert record["id"] == call_id
        assert record["type"] == "meeting"
        assert route.called

    @respx.mock
    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_call_record_sessions(self, mock_auth_provider: MagicMock) -> None:
        """Test fetching sessions for a call record."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token"
        mock_auth_provider.return_value = mock_auth

        call_id = "test-call-123"
        mock_data = {
            "value": [
                {"id": "session-1", "startDateTime": "2024-01-15T10:00:00Z"},
                {"id": "session-2", "startDateTime": "2024-01-15T10:05:00Z"},
            ]
        }

        route = respx.get(
            f"https://graph.microsoft.com/v1.0/communications/callRecords/{call_id}/sessions"
        ).mock(return_value=Response(200, json=mock_data))

        client = GraphClient()
        sessions = client.get_call_record_sessions(call_id)

        assert len(sessions) == 2
        assert sessions[0]["id"] == "session-1"
        assert route.called

    @respx.mock
    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_get_user(self, mock_auth_provider: MagicMock) -> None:
        """Test fetching user information."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token"
        mock_auth_provider.return_value = mock_auth

        user_id = "john@example.com"
        mock_data = {
            "id": "user-123",
            "displayName": "John Doe",
            "mail": user_id,
        }

        route = respx.get(f"https://graph.microsoft.com/v1.0/users/{user_id}").mock(
            return_value=Response(200, json=mock_data)
        )

        client = GraphClient()
        user = client.get_user(user_id)

        assert user["mail"] == user_id
        assert user["displayName"] == "John Doe"
        assert route.called

    @respx.mock
    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_search_users(self, mock_auth_provider: MagicMock) -> None:
        """Test searching for users."""
        mock_auth = MagicMock()
        mock_auth.get_token.return_value = "test-token"
        mock_auth_provider.return_value = mock_auth

        mock_data = {
            "value": [
                {"id": "user-1", "displayName": "John Doe", "mail": "john@example.com"},
                {
                    "id": "user-2",
                    "displayName": "Jane Smith",
                    "mail": "jane@example.com",
                },
            ]
        }

        route = respx.get("https://graph.microsoft.com/v1.0/users").mock(
            return_value=Response(200, json=mock_data)
        )

        client = GraphClient()
        users = client.search_users("John")

        assert len(users) == 2
        assert route.called

    def test_context_manager(self) -> None:
        """Test using GraphClient as a context manager."""
        with GraphClient() as client:
            assert client is not None
            assert isinstance(client, GraphClient)

    @patch("eden_teams.graph.client.GraphAuthProvider")
    def test_close(self, mock_auth_provider: MagicMock) -> None:
        """Test closing the HTTP client."""
        mock_auth = MagicMock()
        mock_auth_provider.return_value = mock_auth

        client = GraphClient()

        # Force client creation
        _ = client.http_client

        assert client._http_client is not None

        client.close()

        assert client._http_client is None
