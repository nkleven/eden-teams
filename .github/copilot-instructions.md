# Eden Teams - Copilot Instructions

## Project Overview
Eden Teams is a Python application for connecting customers to Microsoft Teams Call Detail Records (CDR). It provides AI-powered natural language queries for analyzing Teams call data.

## Technology Stack
- **Language**: Python 3.11+
- **Package Manager**: pip with pyproject.toml
- **APIs**: Microsoft Graph API, OpenAI API
- **Authentication**: Microsoft Entra ID (Azure AD)
- **Testing**: pytest
- **Linting**: pylint, flake8
- **Type Checking**: mypy
- **Formatting**: black, isort

## Project Structure
```
eden-teams/
├── src/
│   └── eden_teams/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── graph/          # Microsoft Graph API integration
│       │   ├── client.py
│       │   └── auth.py
│       ├── cdr/            # Call Detail Records
│       │   ├── models.py
│       │   └── service.py
│       ├── models/         # LLM integration
│       └── utils/
├── tests/
└── data/
```

## Key Concepts

### Call Detail Records (CDR)
- Call records contain metadata about Teams calls
- Includes participants, duration, quality metrics
- Accessed via Microsoft Graph CallRecords API

### Microsoft Graph API
- Use `CallRecords.Read.All` permission for call data
- Use `User.Read.All` for resolving user information
- Authentication via client credentials flow

### Data Models
- `CallRecord` - Represents a single Teams call
- `Participant` - User involved in a call
- `CallQuality` - Audio/video quality metrics

## Coding Guidelines
- Use type hints for all function parameters and return values
- Follow PEP 8 style guidelines
- Write docstrings for all public functions and classes
- Use async/await for API calls where appropriate
- Handle Microsoft Graph API errors gracefully

## Security Guidelines
- Never log sensitive credentials
- Use environment variables for secrets
- Validate all user inputs
- Follow least privilege for API permissions
