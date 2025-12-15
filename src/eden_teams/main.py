"""
Main entry point for the Eden Teams application.

This module provides the main function and CLI interface for interacting
with Microsoft Teams Call Detail Records.
"""

import logging
import sys
from typing import Optional

from dotenv import load_dotenv

from eden_teams.config import settings
from eden_teams.utils.logging_config import setup_logging


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

    # Setup logging
    setup_logging(level=settings.log_level)
    logger = logging.getLogger(__name__)

    logger.info("Starting Eden Teams v%s", settings.app_version)
    logger.info("Environment: %s", settings.app_env)

    # Check configuration
    if not settings.graph_configured:
        logger.warning(
            "Microsoft Graph API not configured. "
            "Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET."
        )

    try:
        if query:
            # Process single query
            logger.info("Processing query: %s", query)
            print(f"Processing: {query}")
            # TODO: Implement query processing with CDR service
        else:
            # Interactive mode
            logger.info("Entering interactive mode")
            print("=" * 60)
            print("Welcome to Eden Teams - Microsoft Teams CDR Assistant")
            print("=" * 60)
            print("\nAsk questions about Teams call records in natural language.")
            print("Examples:")
            print("  - Show me calls from last week")
            print("  - How many calls did john@company.com make yesterday?")
            print("  - What's the average call duration for the sales team?")
            print("\nType 'quit' or 'exit' to leave.")
            print("-" * 60)

            while True:
                try:
                    user_input = input("\nYour question: ").strip()
                    if user_input.lower() in ("quit", "exit", "q"):
                        print("Goodbye!")
                        break
                    if not user_input:
                        continue

                    # TODO: Process the query with CDR service and LLM
                    print(f"\nQuery: {user_input}")
                    print("(CDR processing not yet implemented)")

                except KeyboardInterrupt:
                    print("\nGoodbye!")
                    break

        return 0

    except Exception as e:
        logger.exception("An error occurred: %s", str(e))
        return 1


if __name__ == "__main__":
    sys.exit(main())
