"""
Microsoft Graph API authentication.

This module handles authentication with Microsoft Entra ID (Azure AD)
for accessing the Microsoft Graph API.
"""

import logging
from typing import Optional

from azure.identity import ClientSecretCredential

from eden_teams.config import settings

logger = logging.getLogger(__name__)


def get_graph_credentials() -> Optional[ClientSecretCredential]:
    """
    Get Azure credentials for Microsoft Graph API.

    Returns:
        ClientSecretCredential if configured, None otherwise.
    """
    if not settings.graph_configured:
        logger.warning("Microsoft Graph API credentials not configured")
        return None

    try:
        credential = ClientSecretCredential(
            tenant_id=settings.azure_tenant_id,
            client_id=settings.azure_client_id,
            client_secret=settings.azure_client_secret,
        )
        logger.info("Microsoft Graph credentials initialized")
        return credential
    except (ValueError, TypeError) as e:
        logger.error("Failed to initialize Graph credentials: %s", str(e))
        return None


class GraphAuthProvider:
    """
    Authentication provider for Microsoft Graph API.

    This class manages the authentication lifecycle and token refresh
    for Microsoft Graph API calls.
    """

    def __init__(self) -> None:
        """Initialize the authentication provider."""
        self._credential: Optional[ClientSecretCredential] = None
        self._scopes = ["https://graph.microsoft.com/.default"]

    @property
    def credential(self) -> Optional[ClientSecretCredential]:
        """Get or create the credential."""
        if self._credential is None:
            self._credential = get_graph_credentials()
        return self._credential

    def get_token(self) -> Optional[str]:
        """
        Get an access token for Microsoft Graph API.

        Returns:
            Access token string if successful, None otherwise.
        """
        if self.credential is None:
            return None

        try:
            token = self.credential.get_token(*self._scopes)
            return str(token.token)
        except (ValueError, RuntimeError) as e:
            logger.error("Failed to get access token: %s", str(e))
            return None

    @property
    def is_authenticated(self) -> bool:
        """Check if authentication is available."""
        return self.credential is not None
