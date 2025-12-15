# Bible LLM Project - Copilot Instructions

## Project Overview
This is a Python-based project for building a Bible-focused Large Language Model application.

## Technology Stack
- **Language**: Python 3.11+
- **Package Manager**: pip with pyproject.toml
- **Testing**: pytest
- **Linting**: pylint, flake8
- **Type Checking**: mypy
- **Formatting**: black, isort

## Project Structure
```
eden-teams/
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── src/
│   └── bible_llm/
│       ├── __init__.py
│       ├── main.py
│       ├── data/
│       ├── models/
│       └── utils/
├── tests/
├── data/
├── .gitignore
├── .env.example
├── pyproject.toml
├── requirements.txt
└── README.md
```

## Coding Guidelines
- Use type hints for all function parameters and return values
- Follow PEP 8 style guidelines
- Write docstrings for all public functions and classes
- Use meaningful variable and function names
- Keep functions small and focused
- Write unit tests for all new functionality

## Bible Data Handling
- Store Bible text data in the `data/` directory
- Use UTF-8 encoding for all text files
- Support multiple Bible translations
- Implement proper text preprocessing for LLM consumption

## Development Workflow
1. Create feature branches from `main`
2. Write tests before implementing features (TDD)
3. Run linting and type checking before commits
4. Use meaningful commit messages
