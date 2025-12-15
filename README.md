# Eden Teams

A Python application for connecting customers to Microsoft Teams Call Detail Records (CDR) using AI-powered natural language queries.

## Overview

Eden Teams provides tools and utilities for accessing, analyzing, and querying Microsoft Teams Call Detail Records. It supports:

- **Microsoft Graph API Integration** - Fetch call records from Microsoft Teams
- **Natural Language Queries** - Ask questions about call data in plain English
- **Call Analytics** - Analyze call patterns, duration, quality metrics
- **Customer Lookup** - Connect customers to their Teams call history
- **AI-Powered Insights** - Use LLMs to summarize and explain call data

## Features

- 📞 Retrieve Call Detail Records from Microsoft Teams
- 🔍 Search calls by user, date range, or call type
- 📊 Analyze call quality metrics (jitter, packet loss, latency)
- 🤖 Natural language interface for querying call data
- 📈 Generate reports and summaries
- 🔐 Secure authentication via Microsoft Entra ID (Azure AD)

## Requirements

- Python 3.11 or higher
- Microsoft 365 tenant with Teams
- Azure App Registration with appropriate permissions
- OpenAI API key (or Azure OpenAI) for AI features

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nkleven/eden-teams.git
cd eden-teams
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

# Edit .env and add your credentials
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Microsoft Graph API Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Application Settings
APP_ENV=development
LOG_LEVEL=INFO
```

### Azure App Registration

Your Azure App Registration needs these Microsoft Graph API permissions:
- `CallRecords.Read.All` - Read all call records
- `User.Read.All` - Read user profiles (for resolving user names)

## Usage

### Running the Application

```bash
# Interactive mode
python -m eden_teams.main

# Or using the CLI
eden-teams
```

### Using as a Library

```python
from eden_teams.graph import GraphClient
from eden_teams.cdr import CallRecordService
from eden_teams.models import LLMClient

# Initialize the Graph client
graph = GraphClient()

# Get call records for a user
cdr_service = CallRecordService(graph)
calls = cdr_service.get_user_calls(
    user_id="user@company.com",
    start_date="2024-01-01",
    end_date="2024-01-31"
)

# Display call summary
for call in calls:
    print(f"{call.start_time} - {call.duration}s - {call.call_type}")

# Use AI to analyze calls
llm = LLMClient()
summary = llm.summarize_calls(calls)
print(summary)

# Natural language query
answer = llm.query_calls(
    "How many calls did John Smith make last week?",
    context=calls
)
print(answer)
```

## Project Structure

```
eden-teams/
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   └── extensions.json
├── src/
│   └── eden_teams/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── graph/
│       │   ├── __init__.py
│       │   ├── client.py
│       │   └── auth.py
│       ├── cdr/
│       │   ├── __init__.py
│       │   ├── models.py
│       │   └── service.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── embeddings.py
│       │   └── llm_client.py
│       └── utils/
│           ├── __init__.py
│           └── logging_config.py
├── tests/
├── data/
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── requirements.txt
└── README.md
```

## Microsoft Graph API

### Call Records API

Eden Teams uses the Microsoft Graph Call Records API to fetch detailed information about Teams calls:

- **Call metadata** - Start time, end time, organizer, participants
- **Call quality** - Audio/video quality metrics
- **Session details** - Individual call legs and participants
- **Modalities** - Audio, video, screen sharing, app sharing

### Required Permissions

| Permission | Type | Description |
|------------|------|-------------|
| CallRecords.Read.All | Application | Read all call records |
| User.Read.All | Application | Read all users' profiles |

## Development

### Azure Container Apps (example)

```bash
# Set your subscription
az account set --subscription bf2dc682-be5b-4da7-91f2-1a6709ddc05b

# Assumes resource group 'eden-teams-rg' and location 'eastus' already exist
RG=eden-teams-rg
LOCATION=eastus
ACR_NAME=edenteamsacr
ENV_NAME=eden-env
APP_NAME=eden-teams-app

# Create ACR (once)
az acr create -g "$RG" -n "$ACR_NAME" --sku Basic
az acr login -n "$ACR_NAME"

# Build and push image from repo root
docker build -t "$ACR_NAME.azurecr.io/eden-teams:roadshow" .
docker push "$ACR_NAME.azurecr.io/eden-teams:roadshow"

# Create Container Apps environment (once)
az containerapp env create -g "$RG" -n "$ENV_NAME" -l "$LOCATION"

# Get ACR credentials so the Container App can pull the image (first-run helper)
ACR_USER=$(az acr credential show -g "$RG" -n "$ACR_NAME" --query "username" -o tsv)
ACR_PASS=$(az acr credential show -g "$RG" -n "$ACR_NAME" --query "passwords[0].value" -o tsv)

# Create the Container App (or update image with az containerapp update)
az containerapp create -g "$RG" -n "$APP_NAME" \
  --environment "$ENV_NAME" \
  --image "$ACR_NAME.azurecr.io/eden-teams:roadshow" \
  --registry-server "$ACR_NAME.azurecr.io" \
  --registry-username "$ACR_USER" \
  --registry-password "$ACR_PASS" \
  --ingress external --target-port 8000 \
  --env-vars \
    AZURE_TENANT_ID="<your-tenant-id>" \
    AZURE_CLIENT_ID="<your-client-id>" \
    AZURE_CLIENT_SECRET="<your-client-secret>" \
    OPENAI_API_KEY="<your-openai-key>" \
    APP_ENV="production" \
    LOG_LEVEL="INFO"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/eden_teams --cov-report=html

# Run specific test file
pytest tests/test_cdr.py -v
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

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
