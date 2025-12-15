"""
Pytest configuration and fixtures.
"""

import pytest
from pathlib import Path


@pytest.fixture
def sample_verse_data() -> dict:
    """Provide sample Bible verse data for testing."""
    return {
        "books": [
            {
                "name": "John",
                "chapters": [
                    {
                        "chapter": 3,
                        "verses": [
                            {
                                "verse": 16,
                                "text": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
                            },
                            {
                                "verse": 17,
                                "text": "For God sent not his Son into the world to condemn the world; but that the world through him might be saved."
                            }
                        ]
                    }
                ]
            }
        ]
    }


@pytest.fixture
def temp_data_dir(tmp_path: Path) -> Path:
    """Create a temporary data directory."""
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    return data_dir


@pytest.fixture
def sample_texts() -> list[str]:
    """Provide sample texts for preprocessing tests."""
    return [
        "In the beginning God created the heaven and the earth.",
        "And the earth was without form, and void; and darkness was upon the face of the deep.",
        "And the Spirit of God moved upon the face of the waters.",
    ]
