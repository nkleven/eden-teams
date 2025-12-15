"""
Embedding model wrapper for Bible LLM.

This module provides a unified interface for generating text embeddings
using various embedding models.
"""

import logging
from typing import List, Optional

import numpy as np

from bible_llm.config import settings

logger = logging.getLogger(__name__)


class EmbeddingModel:
    """
    Wrapper for text embedding models.

    Provides a unified interface for generating embeddings using
    OpenAI, Azure OpenAI, or local models.
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        use_azure: Optional[bool] = None,
    ) -> None:
        """
        Initialize the embedding model.

        Args:
            model_name: Name of the embedding model to use.
            use_azure: Whether to use Azure OpenAI. If None, uses config setting.
        """
        self.model_name = model_name or settings.embedding_model
        self.use_azure = use_azure if use_azure is not None else settings.use_azure
        self._client: Optional[object] = None
        logger.info(
            "EmbeddingModel initialized: model=%s, azure=%s",
            self.model_name,
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

    def embed(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.

        Args:
            text: Input text to embed.

        Returns:
            List of floats representing the embedding vector.
        """
        embeddings = self.embed_batch([text])
        return embeddings[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.

        Args:
            texts: List of input texts to embed.

        Returns:
            List of embedding vectors.
        """
        if not texts:
            return []

        logger.debug("Generating embeddings for %d texts", len(texts))

        client = self._get_client()
        response = client.embeddings.create(  # type: ignore[union-attr]
            model=self.model_name,
            input=texts,
        )

        embeddings = [item.embedding for item in response.data]
        logger.debug("Generated %d embeddings", len(embeddings))

        return embeddings

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.

        Args:
            vec1: First embedding vector.
            vec2: Second embedding vector.

        Returns:
            Cosine similarity score between -1 and 1.
        """
        a = np.array(vec1)
        b = np.array(vec2)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def find_similar(
        self,
        query: str,
        candidates: List[str],
        top_k: int = 5,
    ) -> List[tuple[str, float]]:
        """
        Find most similar texts to a query.

        Args:
            query: Query text.
            candidates: List of candidate texts to compare.
            top_k: Number of top results to return.

        Returns:
            List of (text, similarity_score) tuples, sorted by similarity.
        """
        if not candidates:
            return []

        query_embedding = self.embed(query)
        candidate_embeddings = self.embed_batch(candidates)

        similarities = [
            (text, self.cosine_similarity(query_embedding, emb))
            for text, emb in zip(candidates, candidate_embeddings)
        ]

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
