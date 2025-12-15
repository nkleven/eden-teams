"""
Tests for configuration module.
"""

from eden_teams.config import Settings


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
        settings = Settings(APP_ENV="development")
        assert settings.is_development is True
        assert settings.is_production is False

    def test_is_production(self) -> None:
        """Test is_production property."""
        settings = Settings(APP_ENV="production")
        assert settings.is_production is True
        assert settings.is_development is False

    def test_graph_not_configured(self) -> None:
        """Test graph_configured property when not configured."""
        settings = Settings()
        assert settings.graph_configured is False

    def test_graph_configured(self) -> None:
        """Test graph_configured property when configured."""
        settings = Settings(
            AZURE_TENANT_ID="tenant-123",
            AZURE_CLIENT_ID="client-123",
            AZURE_CLIENT_SECRET="secret-123",
        )
        assert settings.graph_configured is True

    def test_use_azure_openai_false(self) -> None:
        """Test use_azure_openai property when not configured."""
        settings = Settings()
        assert settings.use_azure_openai is False

    def test_use_azure_openai_true(self) -> None:
        """Test use_azure_openai property when configured."""
        settings = Settings(
            AZURE_OPENAI_API_KEY="key-123",
            AZURE_OPENAI_ENDPOINT="https://test.openai.azure.com/",
        )
        assert settings.use_azure_openai is True
