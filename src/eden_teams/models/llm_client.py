"""
LLM client for Eden Teams.

This module provides a client for interacting with Large Language Models
to analyze and query Microsoft Teams call records.
"""

import logging
from typing import Dict, List, Optional

from eden_teams.config import settings

logger = logging.getLogger(__name__)


class LLMClient:
    """
    Client for interacting with Large Language Models.

    Provides methods for analyzing call records using natural language
    and generating insights from call data.
    """

    # System prompt for call record analysis
    DEFAULT_SYSTEM_PROMPT = """You are a helpful assistant that analyzes Microsoft Teams call records.
Your role is to help users understand their Teams call data by:
- Answering questions about call patterns and statistics
- Summarizing call activity for users or time periods
- Identifying trends in call duration, frequency, and quality
- Explaining call quality metrics and their implications

When analyzing call data:
- Be specific with numbers and dates
- Highlight important patterns or anomalies
- Provide actionable insights when relevant
- Format responses clearly with bullet points or tables when appropriate
"""

    def __init__(
        self,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        use_azure: Optional[bool] = None,
    ) -> None:
        """
        Initialize the LLM client.

        Args:
            model: Model name to use for completions.
            system_prompt: Custom system prompt. Uses default if None.
            use_azure: Whether to use Azure OpenAI. If None, uses config setting.
        """
        self.model = model or settings.default_model
        self.system_prompt = system_prompt or self.DEFAULT_SYSTEM_PROMPT
        self.use_azure = (
            use_azure if use_azure is not None else settings.use_azure_openai
        )
        self._client: Optional[object] = None
        logger.info(
            "LLMClient initialized: model=%s, azure=%s",
            self.model,
            self.use_azure,
        )

    def _get_client(self) -> object:
        """Get or create the API client."""
        if self._client is None:
            if self.use_azure:
                from openai import AzureOpenAI

                self._client = AzureOpenAI(
                    api_key=settings.azure_openai_api_key,
                    api_version=settings.azure_openai_api_version,
                    azure_endpoint=settings.azure_openai_endpoint,
                )
            else:
                from openai import OpenAI

                self._client = OpenAI(api_key=settings.openai_api_key)
        return self._client

    def chat(
        self,
        message: str,
        context: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Send a chat message and get a response.

        Args:
            message: User message to send.
            context: Additional context (e.g., call record data).
            history: Previous conversation history.
            temperature: Sampling temperature (0-2). Uses config default if None.
            max_tokens: Maximum response tokens. Uses config default if None.

        Returns:
            Model's response text.
        """
        messages = self._build_messages(message, context, history)

        logger.debug("Sending chat request with %d messages", len(messages))

        client = self._get_client()
        response = client.chat.completions.create(  # type: ignore[union-attr]
            model=self.model,
            messages=messages,
            temperature=temperature or settings.temperature,
            max_tokens=max_tokens or settings.max_tokens,
        )

        result = response.choices[0].message.content or ""
        logger.debug("Received response: %d characters", len(result))

        return result

    def _build_messages(
        self,
        message: str,
        context: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> List[Dict[str, str]]:
        """Build the messages list for the API call."""
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": self.system_prompt}
        ]

        # Add conversation history
        if history:
            messages.extend(history)

        # Build user message with optional context
        user_content = message
        if context:
            user_content = f"Call Record Data:\n{context}\n\nQuestion: {message}"

        messages.append({"role": "user", "content": user_content})

        return messages

    def query_calls(
        self,
        question: str,
        call_data: Optional[str] = None,
    ) -> str:
        """
        Answer a question about call records.

        Args:
            question: Natural language question about calls.
            call_data: Formatted call record data as context.

        Returns:
            Answer to the question.
        """
        return self.chat(question, context=call_data)

    def summarize_calls(
        self,
        call_summaries: List[str],
        time_period: Optional[str] = None,
    ) -> str:
        """
        Generate a summary of call activity.

        Args:
            call_summaries: List of call summary strings.
            time_period: Description of the time period (e.g., "last week").

        Returns:
            Natural language summary of call activity.
        """
        context = "\n\n".join(call_summaries)

        period_text = f" for {time_period}" if time_period else ""
        prompt = f"""Please provide a comprehensive summary of the following Teams call activity{period_text}.

Include:
1. Total number of calls
2. Types of calls (meetings, peer-to-peer, etc.)
3. Key participants
4. Average call duration
5. Any notable patterns or observations

Call Records:
{context}"""

        return self.chat(prompt)

    def analyze_call_quality(
        self,
        quality_data: str,
    ) -> str:
        """
        Analyze call quality metrics.

        Args:
            quality_data: Formatted call quality data.

        Returns:
            Analysis of call quality with recommendations.
        """
        prompt = f"""Analyze the following Microsoft Teams call quality metrics and provide insights:

{quality_data}

Please include:
1. Overall quality assessment
2. Any concerning metrics
3. Potential causes for quality issues
4. Recommendations for improvement"""

        return self.chat(prompt)
