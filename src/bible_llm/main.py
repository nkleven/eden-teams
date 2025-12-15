"""
Main entry point for the Bible LLM application.

This module provides the main function and CLI interface for interacting
with the Bible LLM system.
"""

import logging
import sys
from typing import Optional

from dotenv import load_dotenv

from bible_llm.config import settings
from bible_llm.utils.logging_config import setup_logging


def main(query: Optional[str] = None) -> int:
    """
    Main entry point for the Bible LLM application.

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

    logger.info("Starting Bible LLM v%s", settings.app_version)
    logger.info("Environment: %s", settings.app_env)

    try:
        if query:
            # Process single query
            logger.info("Processing query: %s", query)
            # TODO: Implement query processing
            print(f"Processing: {query}")
        else:
            # Interactive mode
            logger.info("Entering interactive mode")
            print("Welcome to Bible LLM!")
            print("Type 'quit' or 'exit' to leave.")
            print("-" * 40)

            while True:
                try:
                    user_input = input("\nYour question: ").strip()
                    if user_input.lower() in ("quit", "exit", "q"):
                        print("Goodbye!")
                        break
                    if not user_input:
                        continue

                    # TODO: Process the query with LLM
                    print(f"You asked: {user_input}")
                    print("(LLM processing not yet implemented)")

                except KeyboardInterrupt:
                    print("\nGoodbye!")
                    break

        return 0

    except Exception as e:
        logger.exception("An error occurred: %s", str(e))
        return 1


if __name__ == "__main__":
    sys.exit(main())
