"""
Tests for the embeddings module.
"""

from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from eden_teams.cdr.models import CallRecord, CallType, Participant
from eden_teams.models.embeddings import CHROMADB_AVAILABLE, EmbeddingsClient


class TestEmbeddingsClient:
    """Tests for EmbeddingsClient class."""

    def test_client_initialization(self) -> None:
        """Test embeddings client can be initialized."""
        client = EmbeddingsClient()
        assert client.collection_name == "call_records"
        assert client.persist_directory == "./chroma_db"

    def test_client_initialization_custom_params(self) -> None:
        """Test embeddings client with custom parameters."""
        client = EmbeddingsClient(
            collection_name="test_collection", persist_directory="/tmp/chroma"
        )
        assert client.collection_name == "test_collection"
        assert client.persist_directory == "/tmp/chroma"

    def test_record_to_document(self) -> None:
        """Test converting call record to document text."""
        client = EmbeddingsClient()

        organizer = Participant(
            display_name="John Doe", email="john@example.com", is_organizer=True
        )
        participant = Participant(display_name="Jane Smith", email="jane@example.com")

        record = CallRecord(
            id="test-call-1",
            call_type=CallType.MEETING,
            start_time=datetime(2024, 1, 15, 10, 30),
            end_time=datetime(2024, 1, 15, 11, 0),
            organizer=organizer,
            participants=[organizer, participant],
        )

        doc = client._record_to_document(record)

        assert "Call Type: meeting" in doc
        assert "2024-01-15" in doc
        assert "30m 0s" in doc
        assert "john@example.com" in doc
        assert "jane@example.com" in doc
        assert "Organizer:" in doc

    def test_record_to_metadata(self) -> None:
        """Test extracting metadata from call record."""
        client = EmbeddingsClient()

        organizer = Participant(
            display_name="John Doe", email="john@example.com", is_organizer=True
        )

        record = CallRecord(
            id="test-call-1",
            call_type=CallType.PEER_TO_PEER,
            start_time=datetime(2024, 1, 15, 10, 30),
            end_time=datetime(2024, 1, 15, 10, 45),
            organizer=organizer,
            participants=[organizer],
        )

        metadata = client._record_to_metadata(record)

        assert metadata["call_type"] == "peerToPeer"
        assert "2024-01-15" in metadata["start_time"]
        assert "2024-01-15" in metadata["end_time"]
        assert metadata["participant_count"] == 1
        assert metadata["duration_seconds"] == 900  # 15 minutes
        assert metadata["organizer"] == "john@example.com"

    @pytest.mark.skipif(
        not CHROMADB_AVAILABLE, reason="ChromaDB not available in test environment"
    )
    @patch("eden_teams.models.embeddings.chromadb.Client")
    def test_add_call_records(self, mock_client_class: MagicMock) -> None:
        """Test adding call records to vector database."""
        # Setup mock
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client

        client = EmbeddingsClient()

        # Create test records
        record = CallRecord(
            id="test-call-1",
            call_type=CallType.MEETING,
            start_time=datetime(2024, 1, 15, 10, 30),
        )

        client.add_call_records([record])

        # Verify collection.add was called
        mock_collection.add.assert_called_once()
        call_args = mock_collection.add.call_args
        assert call_args[1]["ids"] == ["test-call-1"]
        assert len(call_args[1]["documents"]) == 1
        assert len(call_args[1]["metadatas"]) == 1

    @pytest.mark.skipif(
        not CHROMADB_AVAILABLE, reason="ChromaDB not available in test environment"
    )
    @patch("eden_teams.models.embeddings.chromadb.Client")
    def test_search_calls(self, mock_client_class: MagicMock) -> None:
        """Test searching for calls using semantic search."""
        # Setup mock
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client

        # Mock search results
        mock_collection.query.return_value = {
            "ids": [["test-call-1", "test-call-2"]],
            "documents": [["doc1", "doc2"]],
            "metadatas": [[{"call_type": "meeting"}, {"call_type": "peerToPeer"}]],
            "distances": [[0.1, 0.2]],
        }

        client = EmbeddingsClient()
        results = client.search_calls("show me meetings", n_results=2)

        # Verify query was called
        mock_collection.query.assert_called_once_with(
            query_texts=["show me meetings"], n_results=2, where=None
        )

        # Verify results
        assert len(results) == 2
        assert results[0]["id"] == "test-call-1"
        assert results[0]["document"] == "doc1"
        assert results[0]["metadata"]["call_type"] == "meeting"
        assert results[0]["distance"] == 0.1

    @pytest.mark.skipif(
        not CHROMADB_AVAILABLE, reason="ChromaDB not available in test environment"
    )
    @patch("eden_teams.models.embeddings.chromadb.Client")
    def test_delete_call_record(self, mock_client_class: MagicMock) -> None:
        """Test deleting a call record."""
        # Setup mock
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client

        client = EmbeddingsClient()
        client.delete_call_record("test-call-1")

        # Verify delete was called
        mock_collection.delete.assert_called_once_with(ids=["test-call-1"])

    @pytest.mark.skipif(
        not CHROMADB_AVAILABLE, reason="ChromaDB not available in test environment"
    )
    @patch("eden_teams.models.embeddings.chromadb.Client")
    def test_clear_collection(self, mock_client_class: MagicMock) -> None:
        """Test clearing the collection."""
        # Setup mock
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client

        client = EmbeddingsClient()
        client.clear_collection()

        # Verify delete_collection was called
        mock_client.delete_collection.assert_called_once_with(name="call_records")

    def test_chromadb_not_available(self) -> None:
        """Test behavior when ChromaDB is not available."""
        with patch("eden_teams.models.embeddings.CHROMADB_AVAILABLE", False):
            client = EmbeddingsClient()

            # These should not raise errors but log warnings
            client.add_call_records([])
            results = client.search_calls("test query")
            assert results == []

            client.delete_call_record("test-id")
            client.clear_collection()
