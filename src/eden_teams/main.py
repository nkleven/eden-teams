"""
Main entry point for the Eden Teams application.

This module provides the main function and CLI interface for interacting
with Microsoft Teams Call Detail Records.
"""

import argparse
import logging
import sys
from datetime import datetime, timedelta
from typing import List, Optional

from dotenv import load_dotenv

from eden_teams.cdr.models import CallRecord
from eden_teams.cdr.service import CallRecordService
from eden_teams.config import settings
from eden_teams.models.llm_client import LLMClient
from eden_teams.utils.logging_config import setup_logging


class CDRAssistant:
    """
    Assistant for processing natural language queries about call records.

    Combines the CDR service for data retrieval with LLM for natural
    language understanding and response generation.
    """

    def __init__(self) -> None:
        """Initialize the CDR assistant."""
        self._cdr_service: Optional[CallRecordService] = None
        self._llm_client: Optional[LLMClient] = None
        self._conversation_history: List[dict] = []
        self.logger = logging.getLogger(__name__)

    @property
    def cdr_service(self) -> CallRecordService:
        """Get or create the CDR service."""
        if self._cdr_service is None:
            self._cdr_service = CallRecordService()
        return self._cdr_service

    @property
    def llm_client(self) -> LLMClient:
        """Get or create the LLM client."""
        if self._llm_client is None:
            self._llm_client = LLMClient()
        return self._llm_client

    def _format_call_records(self, records: List[CallRecord]) -> str:
        """Format call records as context for the LLM."""
        if not records:
            return "No call records found for the specified criteria."

        lines = [f"Found {len(records)} call record(s):\n"]
        for i, record in enumerate(records[:20], 1):  # Limit to 20 for context size
            lines.append(f"{i}. {record.to_summary()}")
            lines.append("")

        if len(records) > 20:
            lines.append(f"... and {len(records) - 20} more records.")

        return "\n".join(lines)

    def process_query(self, query: str) -> str:
        """
        Process a natural language query about call records.

        Args:
            query: Natural language question about Teams calls.

        Returns:
            Response to the query.
        """
        self.logger.info("Processing query: %s", query)

        # Check if we have the necessary configuration
        if not settings.graph_configured:
            return (
                "Microsoft Graph API is not configured. "
                "Please set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET "
                "environment variables to fetch call records."
            )

        if not settings.openai_api_key and not settings.use_azure_openai:
            return (
                "OpenAI API is not configured. "
                "Please set OPENAI_API_KEY or configure Azure OpenAI "
                "to use natural language processing."
            )

        try:
            # Fetch recent call records for context
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=7)

            self.logger.info(
                "Fetching call records from %s to %s",
                start_date.isoformat(),
                end_date.isoformat(),
            )

            records = self.cdr_service.get_call_records(
                start_date=start_date,
                end_date=end_date,
                limit=100,
            )

            # Format records as context
            context = self._format_call_records(records)

            # Add summary statistics
            if records:
                summary = self.cdr_service.get_call_summary(records)
                context += "\n\nSummary Statistics:\n"
                context += f"- Total Calls: {summary['total_calls']}\n"
                context += f"- Total Duration: {summary['total_duration_formatted']}\n"
                context += f"- Unique Participants: {summary['participant_count']}\n"
                context += f"- Call Types: {summary['call_types']}\n"

            # Send to LLM for natural language processing
            response = self.llm_client.query_calls(query, call_data=context)

            # Store in conversation history
            self._conversation_history.append({"role": "user", "content": query})
            self._conversation_history.append(
                {"role": "assistant", "content": response}
            )

            return response

        except ConnectionError as e:
            self.logger.error("Connection error: %s", str(e))
            return f"Unable to connect to Microsoft Graph API: {e}"
        except ValueError as e:
            self.logger.error("Value error: %s", str(e))
            return f"Error processing request: {e}"

    def clear_history(self) -> None:
        """Clear the conversation history."""
        self._conversation_history = []
        self.logger.info("Conversation history cleared")


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Eden Teams - Microsoft Teams CDR Assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  eden-teams                          # Start interactive mode
  eden-teams -q "Show calls from today"  # Single query mode
  eden-teams --days 14                # Use 14-day date range
        """,
    )
    parser.add_argument(
        "-q",
        "--query",
        type=str,
        help="Single query to process (non-interactive mode)",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days of call history to analyze (default: 7)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose (debug) logging",
    )
    return parser.parse_args()


def main(query: Optional[str] = None) -> int:
    """
    Main entry point for the Eden Teams application.

    Args:
        query: Optional query string to process. If None, enters interactive mode.

    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    # Load environment variables
    load_dotenv()

    # Parse command line arguments
    args = parse_args()

    # Setup logging
    log_level = "DEBUG" if args.verbose else settings.log_level
    setup_logging(level=log_level)
    logger = logging.getLogger(__name__)

    logger.info("Starting Eden Teams v%s", settings.app_version)
    logger.info("Environment: %s", settings.app_env)

    # Check configuration and show status
    print("\n" + "=" * 60)
    print("Eden Teams - Microsoft Teams CDR Assistant")
    print("=" * 60)

    # Show configuration status
    if settings.graph_configured:
        print("✓ Microsoft Graph API: Configured")
    else:
        print("✗ Microsoft Graph API: Not configured")
        logger.warning(
            "Microsoft Graph API not configured. "
            "Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET."
        )

    if settings.openai_api_key or settings.use_azure_openai:
        provider = "Azure OpenAI" if settings.use_azure_openai else "OpenAI"
        print(f"✓ LLM Provider: {provider} ({settings.default_model})")
    else:
        print("✗ LLM Provider: Not configured")
        logger.warning("OpenAI API not configured. Set OPENAI_API_KEY.")

    print("-" * 60)
    print("\nEnterprise (C2) quick check:")
    print("  - Use managed identity + Key Vault for Graph and OpenAI secrets in Azure.")
    print("  - Enable logging/metrics (Log Analytics/App Insights) and basic alerts.")
    print("  - See README: 'Enterprise Readiness (C2 checklist)' for details.\n")

    # Create assistant
    assistant = CDRAssistant()

    try:
        # Use query from args if not passed directly
        effective_query = query or args.query

        if effective_query:
            # Process single query
            logger.info("Processing query: %s", effective_query)
            print(f"\nQuery: {effective_query}\n")

            response = assistant.process_query(effective_query)
            print(response)

        else:
            # Interactive mode
            logger.info("Entering interactive mode")
            print("\nAsk questions about Teams call records in natural language.")
            print("Examples:")
            print("  - Show me calls from last week")
            print("  - How many calls did john@company.com make yesterday?")
            print("  - What's the average call duration?")
            print("  - Summarize call activity for the team")
            print("\nCommands: 'quit' to exit, 'clear' to reset conversation")
            print("-" * 60)

            while True:
                try:
                    user_input = input("\nYou: ").strip()

                    # Handle commands
                    if user_input.lower() in ("quit", "exit", "q"):
                        print("Goodbye!")
                        break
                    if user_input.lower() == "clear":
                        assistant.clear_history()
                        print("Conversation cleared.")
                        continue
                    if not user_input:
                        continue

                    # Process the query
                    print("\nAssistant: ", end="")
                    response = assistant.process_query(user_input)
                    print(response)

                except KeyboardInterrupt:
                    print("\nGoodbye!")
                    break

        return 0

    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        return 0
    except (OSError, RuntimeError) as e:
        logger.exception("An error occurred: %s", str(e))
        return 1


if __name__ == "__main__":
    sys.exit(main())
