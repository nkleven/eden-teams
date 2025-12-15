"""
Configuration management for Bible LLM.

This module provides centralized configuration using Pydantic settings.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application Settings
    app_env: Literal["development", "staging", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    app_version: str = "0.1.0"
    debug: bool = Field(default=True, alias="DEBUG")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # OpenAI Configuration
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")

    # Azure OpenAI Configuration (optional)
    azure_openai_api_key: str = Field(default="", alias="AZURE_OPENAI_API_KEY")
    azure_openai_endpoint: str = Field(default="", alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_version: str = Field(
        default="2024-02-15-preview", alias="AZURE_OPENAI_API_VERSION"
    )

    # Model Configuration
    default_model: str = Field(default="gpt-4", alias="DEFAULT_MODEL")
    embedding_model: str = Field(
        default="text-embedding-3-small", alias="EMBEDDING_MODEL"
    )
    max_tokens: int = Field(default=4096, alias="MAX_TOKENS")
    temperature: float = Field(default=0.7, alias="TEMPERATURE")

    # Database Configuration
    chroma_persist_directory: str = Field(
        default="./chroma_db", alias="CHROMA_PERSIST_DIRECTORY"
    )

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env == "production"

    @property
    def use_azure(self) -> bool:
        """Check if Azure OpenAI should be used."""
        return bool(self.azure_openai_api_key and self.azure_openai_endpoint)


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Returns:
        Settings instance with configuration loaded from environment.
    """
    return Settings()


# Global settings instance
settings = get_settings()
