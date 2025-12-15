"""
Tests for the text preprocessor module.
"""

import pytest

from bible_llm.data.preprocessor import TextPreprocessor, ProcessedText


class TestTextPreprocessor:
    """Tests for TextPreprocessor class."""

    def test_default_initialization(self) -> None:
        """Test default preprocessor initialization."""
        preprocessor = TextPreprocessor()
        assert preprocessor.lowercase is False
        assert preprocessor.remove_punctuation is False
        assert preprocessor.normalize_whitespace is True

    def test_process_basic(self) -> None:
        """Test basic text processing."""
        preprocessor = TextPreprocessor()
        result = preprocessor.process("Hello  world")
        assert isinstance(result, ProcessedText)
        assert result.processed == "Hello world"

    def test_process_lowercase(self) -> None:
        """Test lowercase processing."""
        preprocessor = TextPreprocessor(lowercase=True)
        result = preprocessor.process("Hello World")
        assert result.processed == "hello world"

    def test_process_remove_punctuation(self) -> None:
        """Test punctuation removal."""
        preprocessor = TextPreprocessor(remove_punctuation=True)
        result = preprocessor.process("Hello, world!")
        assert "," not in result.processed
        assert "!" not in result.processed

    def test_normalize_whitespace(self) -> None:
        """Test whitespace normalization."""
        preprocessor = TextPreprocessor(normalize_whitespace=True)
        result = preprocessor.process("  Hello   world  \n\t test  ")
        assert result.processed == "Hello world test"

    def test_expand_contractions(self) -> None:
        """Test contraction expansion."""
        preprocessor = TextPreprocessor(expand_contractions=True)
        result = preprocessor.process("It's a beautiful day, isn't it?")
        assert "it is" in result.processed.lower()
        assert "is not" in result.processed.lower()

    def test_process_batch(self, sample_texts: list[str]) -> None:
        """Test batch processing."""
        preprocessor = TextPreprocessor()
        results = preprocessor.process_batch(sample_texts)
        assert len(results) == len(sample_texts)
        assert all(isinstance(r, ProcessedText) for r in results)

    def test_chunk_text_short(self) -> None:
        """Test chunking short text."""
        preprocessor = TextPreprocessor()
        text = "This is a short text."
        chunks = preprocessor.chunk_text(text, max_tokens=100)
        assert len(chunks) == 1
        assert chunks[0] == text

    def test_chunk_text_long(self) -> None:
        """Test chunking long text."""
        preprocessor = TextPreprocessor()
        # Create a long text
        text = " ".join(["word"] * 1000)
        chunks = preprocessor.chunk_text(text, max_tokens=100, overlap=10)
        assert len(chunks) > 1

    def test_clean_verse_text(self) -> None:
        """Test verse text cleaning."""
        raw = "16 For God so loved the world [commentary note]..."
        cleaned = TextPreprocessor.clean_verse_text(raw)
        assert not cleaned.startswith("16")
        assert "[commentary note]" not in cleaned

    def test_estimate_tokens(self) -> None:
        """Test token estimation."""
        text = "This is a test sentence with several words."
        estimate = TextPreprocessor._estimate_tokens(text)
        assert estimate > 0
        assert isinstance(estimate, int)

    def test_word_count(self) -> None:
        """Test word count in processed text."""
        preprocessor = TextPreprocessor()
        result = preprocessor.process("One two three four five")
        assert result.word_count == 5
