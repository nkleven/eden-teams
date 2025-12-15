"""
Text preprocessing utilities for Bible LLM.

This module provides text preprocessing functions optimized for
Biblical texts and LLM consumption.
"""

import logging
import re
from dataclasses import dataclass
from typing import List

logger = logging.getLogger(__name__)


@dataclass
class ProcessedText:
    """Container for processed text with metadata."""

    original: str
    processed: str
    tokens_estimate: int
    word_count: int


class TextPreprocessor:
    """
    Preprocessor for Biblical texts.

    Provides methods for cleaning, normalizing, and preparing
    Bible texts for use with Large Language Models.
    """

    # Common contractions and their expansions
    CONTRACTIONS = {
        "thou'rt": "thou art",
        "he's": "he is",
        "she's": "she is",
        "it's": "it is",
        "i'm": "i am",
        "we're": "we are",
        "they're": "they are",
        "you're": "you are",
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not",
        "don't": "do not",
        "doesn't": "does not",
        "didn't": "did not",
        "won't": "will not",
        "wouldn't": "would not",
        "couldn't": "could not",
        "shouldn't": "should not",
        "can't": "cannot",
    }

    def __init__(
        self,
        lowercase: bool = False,
        remove_punctuation: bool = False,
        expand_contractions: bool = False,
        normalize_whitespace: bool = True,
    ) -> None:
        """
        Initialize the preprocessor.

        Args:
            lowercase: Convert text to lowercase.
            remove_punctuation: Remove punctuation marks.
            expand_contractions: Expand contractions to full forms.
            normalize_whitespace: Normalize whitespace characters.
        """
        self.lowercase = lowercase
        self.remove_punctuation = remove_punctuation
        self.expand_contractions = expand_contractions
        self.normalize_whitespace = normalize_whitespace
        logger.info("TextPreprocessor initialized")

    def process(self, text: str) -> ProcessedText:
        """
        Process a single text string.

        Args:
            text: Input text to process.

        Returns:
            ProcessedText with original and processed versions.
        """
        processed = text

        if self.normalize_whitespace:
            processed = self._normalize_whitespace(processed)

        if self.expand_contractions:
            processed = self._expand_contractions(processed)

        if self.remove_punctuation:
            processed = self._remove_punctuation(processed)

        if self.lowercase:
            processed = processed.lower()

        return ProcessedText(
            original=text,
            processed=processed,
            tokens_estimate=self._estimate_tokens(processed),
            word_count=len(processed.split()),
        )

    def process_batch(self, texts: List[str]) -> List[ProcessedText]:
        """
        Process multiple texts.

        Args:
            texts: List of input texts.

        Returns:
            List of ProcessedText objects.
        """
        return [self.process(text) for text in texts]

    def chunk_text(
        self,
        text: str,
        max_tokens: int = 512,
        overlap: int = 50,
    ) -> List[str]:
        """
        Split text into chunks suitable for LLM processing.

        Args:
            text: Input text to chunk.
            max_tokens: Maximum tokens per chunk (approximate).
            overlap: Number of overlapping tokens between chunks.

        Returns:
            List of text chunks.
        """
        # Simple word-based chunking (rough token estimate: 1 word ≈ 1.3 tokens)
        words = text.split()
        words_per_chunk = int(max_tokens / 1.3)
        overlap_words = int(overlap / 1.3)

        if len(words) <= words_per_chunk:
            return [text]

        chunks = []
        start = 0

        while start < len(words):
            end = min(start + words_per_chunk, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)

            if end >= len(words):
                break

            start = end - overlap_words

        return chunks

    def _normalize_whitespace(self, text: str) -> str:
        """Normalize whitespace in text."""
        # Replace multiple spaces with single space
        text = re.sub(r"\s+", " ", text)
        # Strip leading/trailing whitespace
        return text.strip()

    def _expand_contractions(self, text: str) -> str:
        """Expand contractions to full forms."""
        for contraction, expansion in self.CONTRACTIONS.items():
            # Case-insensitive replacement
            pattern = re.compile(re.escape(contraction), re.IGNORECASE)
            text = pattern.sub(expansion, text)
        return text

    def _remove_punctuation(self, text: str) -> str:
        """Remove punctuation from text."""
        # Keep apostrophes in contractions if not expanding
        return re.sub(r"[^\w\s']", "", text)

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        """
        Estimate token count for text.

        This is a rough estimate. For accurate counts, use tiktoken.

        Args:
            text: Input text.

        Returns:
            Estimated token count.
        """
        # Rough estimate: 1 token ≈ 4 characters for English
        return len(text) // 4

    @staticmethod
    def clean_verse_text(text: str) -> str:
        """
        Clean Bible verse text.

        Removes verse numbers, brackets, and other annotations
        commonly found in Bible texts.

        Args:
            text: Raw verse text.

        Returns:
            Cleaned verse text.
        """
        # Remove verse numbers at start
        text = re.sub(r"^\d+\s*", "", text)
        # Remove bracketed content (often editorial notes)
        text = re.sub(r"\[.*?\]", "", text)
        # Remove parenthetical references
        text = re.sub(r"\(.*?\)", "", text)
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text
