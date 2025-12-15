"""
Model modules for Bible LLM.

This package provides LLM integration and embedding models
for processing Biblical texts.
"""

from bible_llm.models.embeddings import EmbeddingModel
from bible_llm.models.llm_client import LLMClient

__all__ = ["EmbeddingModel", "LLMClient"]
