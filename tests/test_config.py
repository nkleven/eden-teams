"""
Tests for configuration module.
"""

import pytest
from unittest.mock import patch

from bible_llm.config import Settings, get_settings


class TestSettings:
    """Tests for Settings class."""

    def test_default_settings(self) -> None:
        """Test default settings values."""
        settings = Settings()
        assert settings.app_env == "development"
        assert settings.debug is True
        assert settings.log_level == "INFO"
        assert settings.default_model == "gpt-4"

    def test_is_development(self) -> None:
        """Test is_development property."""
        settings = Settings(app_env="development")
        assert settings.is_development is True
        assert settings.is_production is False

    def test_is_production(self) -> None:
        """Test is_production property."""
        settings = Settings(APP_ENV="production")
        assert settings.is_production is True
        assert settings.is_development is False

    def test_use_azure_false(self) -> None:
        """Test use_azure property when Azure not configured."""
        settings = Settings()
        assert settings.use_azure is False

    def test_use_azure_true(self) -> None:
        """Test use_azure property when Azure is configured."""
        settings = Settings(
            AZURE_OPENAI_API_KEY="test-key",
            AZURE_OPENAI_ENDPOINT="https://test.openai.azure.com/",
        )
        assert settings.use_azure is True

    @patch.dict("os.environ", {"APP_ENV": "production", "DEBUG": "false"})
    def test_settings_from_env(self) -> None:
        """Test loading settings from environment variables."""
        # Clear the cache to get fresh settings
        get_settings.cache_clear()
        settings = Settings()
        assert settings.app_env == "production"
