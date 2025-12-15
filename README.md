# Bible LLM

A Python-based Large Language Model application focused on Biblical texts.

## Overview

Bible LLM provides tools and utilities for working with Biblical texts using modern Large Language Model technologies. It supports:

- Loading and managing Bible text data from multiple translations
- Text preprocessing optimized for LLM consumption
- Semantic search across Bible verses using embeddings
- Question answering about Biblical content
- Verse explanation and translation comparison

## Requirements

- Python 3.11 or higher
- OpenAI API key (or Azure OpenAI)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bible-llm.git
cd bible-llm
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
# Install all dependencies (including dev tools)
pip install -e ".[dev]"

# Or install from requirements.txt
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy the example environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env and add your API keys
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Azure OpenAI (if using Azure)
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Application Settings
APP_ENV=development
LOG_LEVEL=INFO
```

## Usage

### Running the Application

```bash
# Interactive mode
python -m bible_llm.main

# Or using the CLI
bible-llm
```

### Using as a Library

```python
from bible_llm.data import BibleLoader
from bible_llm.models import LLMClient

# Load Bible data
loader = BibleLoader()
loader.load_json("data/raw/kjv.json")

# Get a specific verse
verse = loader.get_verse("John", 3, 16)
print(verse.text)

# Search for verses
results = loader.search("love")
for verse in results:
    print(f"{verse.reference}: {verse.text}")

# Use the LLM client
client = LLMClient()
answer = client.answer_bible_question(
    "What does John 3:16 mean?",
    verses=[verse.text]
)
print(answer)
```

## Project Structure

```
bible-llm/
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   └── extensions.json
├── src/
│   └── bible_llm/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── data/
│       │   ├── __init__.py
│       │   ├── bible_loader.py
│       │   └── preprocessor.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── embeddings.py
│       │   └── llm_client.py
│       └── utils/
│           ├── __init__.py
│           └── logging_config.py
├── tests/
│   ├── conftest.py
│   ├── test_bible_loader.py
│   ├── test_preprocessor.py
│   └── test_config.py
├── data/
│   ├── raw/
│   └── processed/
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── requirements.txt
└── README.md
```

## Development

### Setting Up Development Environment

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Set up pre-commit hooks
pre-commit install
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/bible_llm --cov-report=html

# Run specific test file
pytest tests/test_bible_loader.py -v
```

### Code Quality

```bash
# Format code
black src tests
isort src tests

# Lint code
flake8 src tests
pylint src

# Type checking
mypy src
```

### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality:

```bash
# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## Bible Data

Place your Bible data files in the `data/raw/` directory. The expected JSON format:

```json
{
  "books": [
    {
      "name": "Genesis",
      "chapters": [
        {
          "chapter": 1,
          "verses": [
            {
              "verse": 1,
              "text": "In the beginning God created the heaven and the earth."
            }
          ]
        }
      ]
    }
  ]
}
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
