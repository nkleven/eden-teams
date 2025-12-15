"""
Tests for the LLM client module.
"""

from unittest.mock import MagicMock, patch

import pytest

from eden_teams.models.llm_client import LLMClient


class TestLLMClient:
    """Tests for LLMClient class."""

    def test_client_initialization_default(self) -> None:
        """Test LLM client initialization with defaults."""
        with patch("eden_teams.models.llm_client.settings") as mock_settings:
            mock_settings.default_model = "gpt-4"
            mock_settings.use_azure_openai = False

            client = LLMClient()

            assert client.model == "gpt-4"
            assert client.system_prompt == LLMClient.DEFAULT_SYSTEM_PROMPT
            assert client.use_azure is False

    def test_client_initialization_custom(self) -> None:
        """Test LLM client initialization with custom parameters."""
        custom_prompt = "You are a custom assistant."
        client = LLMClient(
            model="gpt-3.5-turbo", system_prompt=custom_prompt, use_azure=True
        )

        assert client.model == "gpt-3.5-turbo"
        assert client.system_prompt == custom_prompt
        assert client.use_azure is True

    def test_build_messages_simple(self) -> None:
        """Test building messages without context or history."""
        client = LLMClient()
        messages = client._build_messages("What is the weather?")

        assert len(messages) == 2
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "What is the weather?"

    def test_build_messages_with_context(self) -> None:
        """Test building messages with context."""
        client = LLMClient()
        context = "Call Data: 5 calls made today"
        messages = client._build_messages("How many calls?", context=context)

        assert len(messages) == 2
        assert messages[1]["role"] == "user"
        assert "Call Record Data:" in messages[1]["content"]
        assert "5 calls made today" in messages[1]["content"]
        assert "How many calls?" in messages[1]["content"]

    def test_build_messages_with_history(self) -> None:
        """Test building messages with conversation history."""
        client = LLMClient()
        history = [
            {"role": "user", "content": "Previous question"},
            {"role": "assistant", "content": "Previous answer"},
        ]
        messages = client._build_messages("Follow-up question", history=history)

        assert len(messages) == 4
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Previous question"
        assert messages[2]["role"] == "assistant"
        assert messages[2]["content"] == "Previous answer"
        assert messages[3]["role"] == "user"
        assert messages[3]["content"] == "Follow-up question"

    def test_chat(self) -> None:
        """Test chat functionality."""
        # Setup mock for the entire client
        client = LLMClient(use_azure=False)

        # Mock the client to return a simple response
        mock_openai_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "This is the response"
        mock_openai_client.chat.completions.create.return_value = mock_response

        client._client = mock_openai_client

        with patch("eden_teams.models.llm_client.settings") as mock_settings:
            mock_settings.temperature = 0.7
            mock_settings.max_tokens = 4096

            response = client.chat("What is 2+2?")

            assert response == "This is the response"
            mock_openai_client.chat.completions.create.assert_called_once()

    def test_chat_with_custom_params(self) -> None:
        """Test chat with custom temperature and max_tokens."""
        client = LLMClient(use_azure=False)

        # Mock the client
        mock_openai_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Response"
        mock_openai_client.chat.completions.create.return_value = mock_response

        client._client = mock_openai_client

        response = client.chat("Test query", temperature=0.5, max_tokens=1000)

        assert response == "Response"
        call_kwargs = mock_openai_client.chat.completions.create.call_args[1]
        assert call_kwargs["temperature"] == 0.5
        assert call_kwargs["max_tokens"] == 1000

    def test_query_calls(self) -> None:
        """Test querying calls."""
        client = LLMClient(use_azure=False)

        # Mock the client
        mock_openai_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "There were 5 calls"
        mock_openai_client.chat.completions.create.return_value = mock_response

        client._client = mock_openai_client

        with patch("eden_teams.models.llm_client.settings") as mock_settings:
            mock_settings.temperature = 0.7
            mock_settings.max_tokens = 4096

            response = client.query_calls("How many calls?", call_data="Call data here")

            assert response == "There were 5 calls"

    def test_summarize_calls(self) -> None:
        """Test summarizing calls."""
        client = LLMClient(use_azure=False)

        # Mock the client
        mock_openai_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Summary of calls"
        mock_openai_client.chat.completions.create.return_value = mock_response

        client._client = mock_openai_client

        with patch("eden_teams.models.llm_client.settings") as mock_settings:
            mock_settings.temperature = 0.7
            mock_settings.max_tokens = 4096

            summaries = ["Call 1: Meeting at 10am", "Call 2: Call at 2pm"]
            response = client.summarize_calls(summaries, time_period="last week")

            assert response == "Summary of calls"
            # Verify the prompt includes the time period
            call_args = mock_openai_client.chat.completions.create.call_args[1]
            messages = call_args["messages"]
            user_message = messages[-1]["content"]
            assert "last week" in user_message

    def test_analyze_call_quality(self) -> None:
        """Test analyzing call quality."""
        client = LLMClient(use_azure=False)

        # Mock the client
        mock_openai_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Quality analysis"
        mock_openai_client.chat.completions.create.return_value = mock_response

        client._client = mock_openai_client

        with patch("eden_teams.models.llm_client.settings") as mock_settings:
            mock_settings.temperature = 0.7
            mock_settings.max_tokens = 4096

            quality_data = "Jitter: 30ms, Packet loss: 2%"
            response = client.analyze_call_quality(quality_data)

            assert response == "Quality analysis"
            # Verify the prompt includes quality data
            call_args = mock_openai_client.chat.completions.create.call_args[1]
            messages = call_args["messages"]
            user_message = messages[-1]["content"]
            assert "Jitter: 30ms" in user_message

    def test_chat_empty_response(self) -> None:
        """Test handling empty response from LLM."""
        client = LLMClient(use_azure=False)

        # Mock the client
        mock_openai_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = None
        mock_openai_client.chat.completions.create.return_value = mock_response

        client._client = mock_openai_client

        with patch("eden_teams.models.llm_client.settings") as mock_settings:
            mock_settings.temperature = 0.7
            mock_settings.max_tokens = 4096

            response = client.chat("Test")

            assert response == ""
