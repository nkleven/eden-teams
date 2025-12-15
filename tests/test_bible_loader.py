"""
Tests for the Bible loader module.
"""

import json
import pytest
from pathlib import Path

from bible_llm.data.bible_loader import BibleLoader, BibleVerse, BibleChapter


class TestBibleVerse:
    """Tests for BibleVerse dataclass."""

    def test_verse_creation(self) -> None:
        """Test creating a Bible verse."""
        verse = BibleVerse(
            book="John",
            chapter=3,
            verse=16,
            text="For God so loved the world...",
            translation="KJV"
        )
        assert verse.book == "John"
        assert verse.chapter == 3
        assert verse.verse == 16
        assert verse.translation == "KJV"

    def test_verse_reference(self) -> None:
        """Test verse reference property."""
        verse = BibleVerse(
            book="Genesis",
            chapter=1,
            verse=1,
            text="In the beginning..."
        )
        assert verse.reference == "Genesis 1:1"

    def test_verse_to_dict(self) -> None:
        """Test converting verse to dictionary."""
        verse = BibleVerse(
            book="Psalms",
            chapter=23,
            verse=1,
            text="The Lord is my shepherd",
            translation="KJV"
        )
        result = verse.to_dict()
        assert result["book"] == "Psalms"
        assert result["chapter"] == 23
        assert result["verse"] == 1
        assert result["reference"] == "Psalms 23:1"


class TestBibleChapter:
    """Tests for BibleChapter dataclass."""

    def test_chapter_full_text(self) -> None:
        """Test getting full chapter text."""
        verses = [
            BibleVerse("Genesis", 1, 1, "In the beginning..."),
            BibleVerse("Genesis", 1, 2, "And the earth was..."),
        ]
        chapter = BibleChapter(book="Genesis", chapter=1, verses=verses)
        assert "In the beginning..." in chapter.full_text
        assert "And the earth was..." in chapter.full_text

    def test_chapter_verse_count(self) -> None:
        """Test verse count property."""
        verses = [
            BibleVerse("Genesis", 1, 1, "Text 1"),
            BibleVerse("Genesis", 1, 2, "Text 2"),
            BibleVerse("Genesis", 1, 3, "Text 3"),
        ]
        chapter = BibleChapter(book="Genesis", chapter=1, verses=verses)
        assert chapter.verse_count == 3


class TestBibleLoader:
    """Tests for BibleLoader class."""

    def test_loader_initialization(self, temp_data_dir: Path) -> None:
        """Test loader initialization."""
        loader = BibleLoader(data_dir=temp_data_dir)
        assert loader.data_dir == temp_data_dir
        assert loader.verse_count == 0

    def test_load_json(
        self, temp_data_dir: Path, sample_verse_data: dict
    ) -> None:
        """Test loading Bible data from JSON."""
        # Create test JSON file
        json_path = temp_data_dir / "test_bible.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(sample_verse_data, f)

        loader = BibleLoader(data_dir=temp_data_dir)
        count = loader.load_json(json_path, translation="KJV")

        assert count == 2
        assert loader.verse_count == 2
        assert "KJV" in loader.loaded_translations

    def test_get_verse(
        self, temp_data_dir: Path, sample_verse_data: dict
    ) -> None:
        """Test retrieving a specific verse."""
        json_path = temp_data_dir / "test_bible.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(sample_verse_data, f)

        loader = BibleLoader(data_dir=temp_data_dir)
        loader.load_json(json_path)

        verse = loader.get_verse("John", 3, 16)
        assert verse is not None
        assert verse.book == "John"
        assert "God so loved" in verse.text

    def test_get_verse_not_found(self, temp_data_dir: Path) -> None:
        """Test getting a verse that doesn't exist."""
        loader = BibleLoader(data_dir=temp_data_dir)
        verse = loader.get_verse("NonExistent", 1, 1)
        assert verse is None

    def test_search(
        self, temp_data_dir: Path, sample_verse_data: dict
    ) -> None:
        """Test searching for verses."""
        json_path = temp_data_dir / "test_bible.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(sample_verse_data, f)

        loader = BibleLoader(data_dir=temp_data_dir)
        loader.load_json(json_path)

        results = loader.search("loved")
        assert len(results) == 1
        assert "loved" in results[0].text.lower()

    def test_iter_verses(
        self, temp_data_dir: Path, sample_verse_data: dict
    ) -> None:
        """Test iterating over verses."""
        json_path = temp_data_dir / "test_bible.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(sample_verse_data, f)

        loader = BibleLoader(data_dir=temp_data_dir)
        loader.load_json(json_path)

        verses = list(loader.iter_verses())
        assert len(verses) == 2
