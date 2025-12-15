"""
Bible text loader module.

This module provides functionality for loading Bible texts from various
formats and translations.
"""

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterator, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class BibleVerse:
    """Represents a single Bible verse."""

    book: str
    chapter: int
    verse: int
    text: str
    translation: str = "KJV"

    @property
    def reference(self) -> str:
        """Get the verse reference string."""
        return f"{self.book} {self.chapter}:{self.verse}"

    def to_dict(self) -> Dict[str, str | int]:
        """Convert verse to dictionary."""
        return {
            "book": self.book,
            "chapter": self.chapter,
            "verse": self.verse,
            "text": self.text,
            "translation": self.translation,
            "reference": self.reference,
        }


@dataclass
class BibleChapter:
    """Represents a Bible chapter."""

    book: str
    chapter: int
    verses: List[BibleVerse] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        """Get the full text of the chapter."""
        return " ".join(v.text for v in self.verses)

    @property
    def verse_count(self) -> int:
        """Get the number of verses in the chapter."""
        return len(self.verses)


class BibleLoader:
    """
    Loads and manages Bible text data.

    This class provides methods for loading Bible texts from various
    file formats and accessing verses, chapters, and books.
    """

    # Standard book order
    OLD_TESTAMENT_BOOKS = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
        "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
        "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
        "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
        "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
        "Haggai", "Zechariah", "Malachi"
    ]

    NEW_TESTAMENT_BOOKS = [
        "Matthew", "Mark", "Luke", "John", "Acts",
        "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
        "Ephesians", "Philippians", "Colossians",
        "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
        "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
        "1 John", "2 John", "3 John", "Jude", "Revelation"
    ]

    def __init__(self, data_dir: Optional[Path] = None) -> None:
        """
        Initialize the Bible loader.

        Args:
            data_dir: Directory containing Bible data files.
        """
        self.data_dir = data_dir or Path("data")
        self._verses: Dict[str, BibleVerse] = {}
        self._loaded_translations: List[str] = []
        logger.info("BibleLoader initialized with data_dir: %s", self.data_dir)

    def load_json(self, filepath: Path, translation: str = "KJV") -> int:
        """
        Load Bible data from a JSON file.

        Args:
            filepath: Path to the JSON file.
            translation: Translation identifier.

        Returns:
            Number of verses loaded.

        Raises:
            FileNotFoundError: If the file doesn't exist.
            json.JSONDecodeError: If the file is not valid JSON.
        """
        logger.info("Loading Bible from JSON: %s", filepath)

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        verse_count = 0
        for book_data in data.get("books", []):
            book_name = book_data.get("name", "")
            for chapter_data in book_data.get("chapters", []):
                chapter_num = chapter_data.get("chapter", 0)
                for verse_data in chapter_data.get("verses", []):
                    verse = BibleVerse(
                        book=book_name,
                        chapter=chapter_num,
                        verse=verse_data.get("verse", 0),
                        text=verse_data.get("text", ""),
                        translation=translation,
                    )
                    key = f"{translation}:{verse.reference}"
                    self._verses[key] = verse
                    verse_count += 1

        self._loaded_translations.append(translation)
        logger.info("Loaded %d verses from %s", verse_count, translation)
        return verse_count

    def get_verse(
        self, book: str, chapter: int, verse: int, translation: str = "KJV"
    ) -> Optional[BibleVerse]:
        """
        Get a specific verse.

        Args:
            book: Book name.
            chapter: Chapter number.
            verse: Verse number.
            translation: Translation identifier.

        Returns:
            BibleVerse if found, None otherwise.
        """
        key = f"{translation}:{book} {chapter}:{verse}"
        return self._verses.get(key)

    def get_chapter(
        self, book: str, chapter: int, translation: str = "KJV"
    ) -> Optional[BibleChapter]:
        """
        Get all verses in a chapter.

        Args:
            book: Book name.
            chapter: Chapter number.
            translation: Translation identifier.

        Returns:
            BibleChapter if found, None otherwise.
        """
        verses = [
            v for key, v in self._verses.items()
            if v.book == book and v.chapter == chapter and v.translation == translation
        ]

        if not verses:
            return None

        verses.sort(key=lambda v: v.verse)
        return BibleChapter(book=book, chapter=chapter, verses=verses)

    def search(
        self, query: str, translation: str = "KJV", limit: int = 10
    ) -> List[BibleVerse]:
        """
        Search for verses containing the query string.

        Args:
            query: Search query.
            translation: Translation to search in.
            limit: Maximum number of results.

        Returns:
            List of matching verses.
        """
        query_lower = query.lower()
        results = []

        for verse in self._verses.values():
            if verse.translation == translation and query_lower in verse.text.lower():
                results.append(verse)
                if len(results) >= limit:
                    break

        return results

    def iter_verses(self, translation: str = "KJV") -> Iterator[BibleVerse]:
        """
        Iterate over all verses in a translation.

        Args:
            translation: Translation to iterate.

        Yields:
            BibleVerse objects.
        """
        for verse in self._verses.values():
            if verse.translation == translation:
                yield verse

    @property
    def verse_count(self) -> int:
        """Get total number of loaded verses."""
        return len(self._verses)

    @property
    def loaded_translations(self) -> List[str]:
        """Get list of loaded translations."""
        return self._loaded_translations.copy()
