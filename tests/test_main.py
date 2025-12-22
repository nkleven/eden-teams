"""
Tests for the main module.
"""

from unittest.mock import MagicMock, patch

from eden_teams.main import CDRAssistant


class TestCDRAssistant:
    """Tests for CDRAssistant class."""

    def test_assistant_initialization(self) -> None:
        """Test assistant can be initialized."""
        assistant = CDRAssistant()
        assert assistant._cdr_service is None
        assert assistant._llm_client is None
        assert assistant._conversation_history == []

    def test_clear_history(self) -> None:
        """Test clearing conversation history."""
        assistant = CDRAssistant()
        assistant._conversation_history = [
            {"role": "user", "content": "test"},
            {"role": "assistant", "content": "response"},
        ]
        assistant.clear_history()
        assert assistant._conversation_history == []

    def test_format_call_records_empty(self) -> None:
        """Test formatting empty call records."""
        assistant = CDRAssistant()
        result = assistant._format_call_records([])
        assert "No call records found" in result

    @patch("eden_teams.main.settings")
    def test_process_query_no_graph_config(self, mock_settings: MagicMock) -> None:
        """Test query processing when Graph API not configured."""
        mock_settings.graph_configured = False
        assistant = CDRAssistant()

        result = assistant.process_query("Show me calls")
        assert "not configured" in result.lower()
        assert "Graph API" in result or "AZURE_" in result

    @patch("eden_teams.main.settings")
    def test_process_query_no_openai_config(self, mock_settings: MagicMock) -> None:
        """Test query processing when OpenAI not configured."""
        mock_settings.graph_configured = True
        mock_settings.openai_api_key = ""
        mock_settings.use_azure_openai = False
        assistant = CDRAssistant()

        result = assistant.process_query("Show me calls")
        assert "not configured" in result.lower()
        assert "OpenAI" in result
