"""
Data handling modules for Bible LLM.

This package provides utilities for loading, preprocessing, and managing
Bible text data for use with Large Language Models.
"""

from bible_llm.data.bible_loader import BibleLoader
from bible_llm.data.preprocessor import TextPreprocessor

__all__ = ["BibleLoader", "TextPreprocessor"]
