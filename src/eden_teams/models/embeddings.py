"""
Embeddings and vector search for Eden Teams.

This module provides functionality for creating embeddings from call records
and performing semantic search over call data.
"""

import logging
from typing import Any, Dict, List, Optional

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings

    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

from eden_teams.cdr.models import CallRecord
from eden_teams.config import settings

logger = logging.getLogger(__name__)


class EmbeddingsClient:
    """
    Client for generating embeddings and performing vector search.

    This class provides methods for creating embeddings from call records
    and searching for similar calls using semantic search.
    """

    def __init__(
        self,
        collection_name: str = "call_records",
        persist_directory: str = "./chroma_db",
    ) -> None:
        """
        Initialize the embeddings client.

        Args:
            collection_name: Name of the ChromaDB collection.
            persist_directory: Directory to persist the vector database.
        """
        if not CHROMADB_AVAILABLE:
            logger.warning(
                "ChromaDB not available. Install chromadb to use embeddings."
            )

        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self._client: Optional[chromadb.Client] = None
        self._collection: Optional[chromadb.Collection] = None

        if CHROMADB_AVAILABLE:
            logger.info(
                "EmbeddingsClient initialized: collection=%s, persist_dir=%s",
                collection_name,
                persist_directory,
            )

    @property
    def client(self) -> Optional[chromadb.Client]:
        """Get or create the ChromaDB client."""
        if not CHROMADB_AVAILABLE:
            return None

        if self._client is None:
            self._client = chromadb.Client(
                ChromaSettings(
                    persist_directory=self.persist_directory,
                    anonymized_telemetry=False,
                )
            )
        return self._client

    @property
    def collection(self) -> Optional[chromadb.Collection]:
        """Get or create the ChromaDB collection."""
        if not CHROMADB_AVAILABLE or self.client is None:
            return None

        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name
            )
        return self._collection

    def add_call_records(self, records: List[CallRecord]) -> None:
        """
        Add call records to the vector database.

        Args:
            records: List of CallRecord objects to add.
        """
        if not CHROMADB_AVAILABLE or self.collection is None:
            logger.warning("ChromaDB not available. Cannot add call records.")
            return

        documents = []
        metadatas = []
        ids = []

        for record in records:
            # Create a text representation of the call record
            doc_text = self._record_to_document(record)
            documents.append(doc_text)

            # Create metadata
            metadata = self._record_to_metadata(record)
            metadatas.append(metadata)

            # Use call ID as the unique identifier
            ids.append(record.id)

        if documents:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info("Added %d call records to vector database", len(documents))

    def search_calls(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for call records using semantic search.

        Args:
            query: Natural language search query.
            n_results: Number of results to return.
            where: Optional metadata filter.

        Returns:
            List of matching call record dictionaries with metadata.
        """
        if not CHROMADB_AVAILABLE or self.collection is None:
            logger.warning("ChromaDB not available. Cannot search call records.")
            return []

        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where,
        )

        # Format results
        formatted_results = []
        if results and results.get("ids"):
            for i, call_id in enumerate(results["ids"][0]):
                result = {
                    "id": call_id,
                    "document": (
                        results["documents"][0][i] if results.get("documents") else None
                    ),
                    "metadata": (
                        results["metadatas"][0][i] if results.get("metadatas") else None
                    ),
                    "distance": (
                        results["distances"][0][i] if results.get("distances") else None
                    ),
                }
                formatted_results.append(result)

        return formatted_results

    def delete_call_record(self, call_id: str) -> None:
        """
        Delete a call record from the vector database.

        Args:
            call_id: ID of the call record to delete.
        """
        if not CHROMADB_AVAILABLE or self.collection is None:
            logger.warning("ChromaDB not available. Cannot delete call record.")
            return

        self.collection.delete(ids=[call_id])
        logger.info("Deleted call record %s from vector database", call_id)

    def clear_collection(self) -> None:
        """Clear all call records from the collection."""
        if not CHROMADB_AVAILABLE or self.client is None:
            logger.warning("ChromaDB not available. Cannot clear collection.")
            return

        self.client.delete_collection(name=self.collection_name)
        self._collection = None
        logger.info("Cleared collection %s", self.collection_name)

    def _record_to_document(self, record: CallRecord) -> str:
        """
        Convert a call record to a text document for embedding.

        Args:
            record: CallRecord object to convert.

        Returns:
            Text representation of the call record.
        """
        parts = [
            f"Call Type: {record.call_type.value}",
            f"Start Time: {record.start_time.isoformat()}",
            f"Duration: {record.duration_formatted}",
            f"Participants: {', '.join(record.get_participant_names())}",
        ]

        if record.organizer:
            parts.append(f"Organizer: {record.organizer.identifier}")

        if record.modalities:
            parts.append(f"Modalities: {', '.join(m.value for m in record.modalities)}")

        return " | ".join(parts)

    def _record_to_metadata(self, record: CallRecord) -> Dict[str, Any]:
        """
        Extract metadata from a call record.

        Args:
            record: CallRecord object to extract metadata from.

        Returns:
            Dictionary of metadata.
        """
        metadata: Dict[str, Any] = {
            "call_type": record.call_type.value,
            "start_time": record.start_time.isoformat(),
            "participant_count": record.participant_count,
        }

        if record.end_time:
            metadata["end_time"] = record.end_time.isoformat()

        if record.duration_seconds:
            metadata["duration_seconds"] = record.duration_seconds

        if record.organizer:
            metadata["organizer"] = record.organizer.identifier

        return metadata
