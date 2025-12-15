"""
Microsoft Graph API client.

This module provides the main client for interacting with
Microsoft Graph API endpoints.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

from eden_teams.config import settings
from eden_teams.graph.auth import GraphAuthProvider

logger = logging.getLogger(__name__)


class GraphClient:
    """
    Client for Microsoft Graph API.

    This class provides methods for making authenticated requests
    to Microsoft Graph API endpoints.
    """

    BASE_URL = "https://graph.microsoft.com"

    def __init__(self) -> None:
        """Initialize the Graph client."""
        self._auth = GraphAuthProvider()
        self._http_client: Optional[httpx.Client] = None
        logger.info("GraphClient initialized")

    @property
    def http_client(self) -> httpx.Client:
        """Get or create the HTTP client."""
        if self._http_client is None:
            self._http_client = httpx.Client(
                base_url=f"{self.BASE_URL}/{settings.graph_api_version}",
                timeout=30.0,
            )
        return self._http_client

    def _get_headers(self) -> Dict[str, str]:
        """Get headers with authentication token."""
        token = self._auth.get_token()
        if token is None:
            raise RuntimeError("Failed to get authentication token")

        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def get(
        self, endpoint: str, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GET request to Microsoft Graph API.

        Args:
            endpoint: API endpoint path.
            params: Optional query parameters.

        Returns:
            JSON response as dictionary.

        Raises:
            httpx.HTTPStatusError: If the request fails.
        """
        response = self.http_client.get(
            endpoint,
            headers=self._get_headers(),
            params=params,
        )
        response.raise_for_status()
        return response.json()

    def get_call_records(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        top: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get call records from Microsoft Graph API.

        Args:
            start_date: Start of date range filter.
            end_date: End of date range filter.
            top: Maximum number of records to return.

        Returns:
            List of call record dictionaries.
        """
        endpoint = "/communications/callRecords"
        params: Dict[str, Any] = {}

        if top:
            params["$top"] = min(top, settings.call_records_page_size)

        # Build filter for date range
        filters = []
        if start_date:
            filters.append(f"startDateTime ge {start_date.isoformat()}Z")
        if end_date:
            filters.append(f"startDateTime le {end_date.isoformat()}Z")

        if filters:
            params["$filter"] = " and ".join(filters)

        logger.info("Fetching call records with params: %s", params)

        try:
            response = self.get(endpoint, params)
            records = response.get("value", [])
            logger.info("Retrieved %d call records", len(records))
            return records
        except httpx.HTTPStatusError as e:
            logger.error("Failed to fetch call records: %s", str(e))
            raise

    def get_call_record(self, call_id: str) -> Dict[str, Any]:
        """
        Get a specific call record by ID.

        Args:
            call_id: The unique identifier of the call record.

        Returns:
            Call record dictionary.
        """
        endpoint = f"/communications/callRecords/{call_id}"
        return self.get(endpoint)

    def get_call_record_sessions(self, call_id: str) -> List[Dict[str, Any]]:
        """
        Get sessions for a specific call record.

        Args:
            call_id: The unique identifier of the call record.

        Returns:
            List of session dictionaries.
        """
        endpoint = f"/communications/callRecords/{call_id}/sessions"
        response = self.get(endpoint)
        return response.get("value", [])

    def get_user(self, user_id: str) -> Dict[str, Any]:
        """
        Get user information by ID or email.

        Args:
            user_id: User ID or email address.

        Returns:
            User information dictionary.
        """
        endpoint = f"/users/{user_id}"
        return self.get(endpoint)

    def search_users(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for users by name or email.

        Args:
            query: Search query string.

        Returns:
            List of matching user dictionaries.
        """
        endpoint = "/users"
        params = {
            "$filter": (
                f"startswith(displayName, '{query}') " f"or startswith(mail, '{query}')"
            ),
            "$top": 10,
        }
        response = self.get(endpoint, params)
        return response.get("value", [])

    def close(self) -> None:
        """Close the HTTP client."""
        if self._http_client:
            self._http_client.close()
            self._http_client = None

    def __enter__(self) -> "GraphClient":
        """Context manager entry."""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit."""
        self.close()
