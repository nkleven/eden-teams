"""
Microsoft Graph API integration for Eden Teams.

This package provides authentication and client utilities for
interacting with the Microsoft Graph API.
"""

from eden_teams.graph.auth import get_graph_credentials
from eden_teams.graph.client import GraphClient

__all__ = ["GraphClient", "get_graph_credentials"]
