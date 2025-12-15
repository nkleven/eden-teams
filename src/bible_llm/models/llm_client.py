"""
LLM client wrapper for Bible LLM.

This module provides a unified interface for interacting with
Large Language Models for Bible-related queries.
"""

import logging
from typing import Dict, List, Optional

from bible_llm.config import settings

logger = logging.getLogger(__name__)


class LLMClient:
    """
    Client for interacting with Large Language Models.

    Provides a unified interface for OpenAI and Azure OpenAI APIs
    with Bible-specific prompt templates and configurations.
    """

    # System prompt for Bible-focused interactions
    DEFAULT_SYSTEM_PROMPT = """You are a knowledgeable Bible scholar and assistant.
Your role is to help users understand Biblical texts, provide accurate quotations,
explain theological concepts, and offer insights based on scripture.

Guidelines:
- Always cite specific Bible verses when referencing scripture
- Provide historical and cultural context when relevant
- Be respectful of different interpretations and traditions
- Acknowledge when topics are debated among scholars
- Focus on education and understanding, not preaching
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
        self.use_azure = use_azure if use_azure is not None else settings.use_azure
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
            context: Additional context (e.g., relevant Bible verses).
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
            user_content = f"Context:\n{context}\n\nQuestion: {message}"

        messages.append({"role": "user", "content": user_content})

        return messages

    def answer_bible_question(
        self,
        question: str,
        verses: Optional[List[str]] = None,
    ) -> str:
        """
        Answer a Bible-related question.

        Args:
            question: The question to answer.
            verses: Optional list of relevant Bible verses as context.

        Returns:
            Answer to the question.
        """
        context = None
        if verses:
            context = "Relevant Bible verses:\n" + "\n".join(f"- {v}" for v in verses)

        return self.chat(question, context=context)

    def explain_verse(self, verse_reference: str, verse_text: str) -> str:
        """
        Explain a Bible verse.

        Args:
            verse_reference: The verse reference (e.g., "John 3:16").
            verse_text: The text of the verse.

        Returns:
            Explanation of the verse.
        """
        prompt = f"""Please explain the following Bible verse:

{verse_reference}: "{verse_text}"

Provide:
1. A brief explanation of the verse's meaning
2. Historical/cultural context
3. How this verse connects to broader Biblical themes
"""
        return self.chat(prompt)

    def compare_translations(
        self,
        verse_reference: str,
        translations: Dict[str, str],
    ) -> str:
        """
        Compare different translations of a verse.

        Args:
            verse_reference: The verse reference.
            translations: Dictionary of {translation_name: verse_text}.

        Returns:
            Analysis of the translation differences.
        """
        translations_text = "\n".join(
            f'{name}: "{text}"' for name, text in translations.items()
        )

        prompt = f"""Compare these different translations of {verse_reference}:

{translations_text}

Analyze:
1. Key differences in wording
2. How different word choices affect meaning
3. Which translation might be most appropriate for different purposes
"""
        return self.chat(prompt)
