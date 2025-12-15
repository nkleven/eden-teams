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

### 5. IDE & GitHub extensions (2025‑12‑15T23:15:09.711Z)

Install these VS Code extensions so the local dev experience matches the repo’s expectations:
- **GitHub Copilot** (core suggestions)
- **GitHub Copilot Chat**
- **GitHub Copilot Edits**
- **GitHub Pull Requests & Issues**
- **GitHub Repositories**

They’re optional for runtime but required for the documented OOBE/testing walkthroughs—after installing, reload VS Code so authentication kicks in before running the steps below.

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

### UI/UX Roadmap

We are building a shared React + Fluent UI experience that can ship both as a standalone web app and as a Teams tab:

- **Core SPA (shared)** – Create React App / Vite with TypeScript, `@fluentui/react-components`, `@azure/msal-browser`, `@azure/msal-react`. Pages: Home (query console + results), Call Explorer (filters + timeline/table), Admin (health + C2 checklist). All API calls go through `eden-api`.
- **Option A: Standalone web app** – Host the built SPA in Azure Static Web Apps (or App Service) with MSAL redirect URI `https://eden-teams-ui.<region>.azurestaticapps.net` (or custom domain) and set `REACT_APP_API_BASE` to your Container App URL.
- **Option B: Teams app wrapper** – Host the same SPA at an HTTPS endpoint (e.g., `https://teamsui.kellzkreations.com`), add Microsoft Teams JS SDK for SSO, and package a Teams app manifest with a Personal Tab pointing to the SPA.
- **Next steps (2025‑12‑15T19:00:06.961Z)** – Scaffold the React app, add MSAL auth + Fluent UI shell, implement the Home query console, and create the Teams app manifest so Charlie can demo inside Microsoft Teams.

##### Custom domain + Azure DNS (OOBE helper – 2025‑12‑15T22:49:49.424Z)

1. **DNS**: In your DNS zone, add `CNAME eden-teams -> eden-api.redmushroom-c729ca5a.eastus2.azurecontainerapps.io` (remove A records with that host).
2. **Portal binding**: Azure Portal → Container Apps → `eden-api` → Custom domains → remove stale entries → **Add custom domain**, enter `eden-teams.kellzkreations.com`, select **Managed certificate**, follow any TXT verification, and wait for “Healthy” + `bindingType: SniEnabled`.
3. **Smoke**: `nslookup eden-teams.kellzkreations.com` (should point to the Container App FQDN) and `curl -I https://eden-teams.kellzkreations.com` (should match the direct FQDN instead of `ERR_CONNECTION_RESET`).

##### Demo / test users (2025‑12‑15T23:05:48.304Z)

These Entra ID users are reserved for Charlie’s roadshow so the OOBE feels real without touching production accounts:

| Name          | UPN / Email                           | Password | Notes |
|---------------|---------------------------------------|----------|-------|
| Alice Rivers  | alice.rivers@contoso.onmicrosoft.com  | Alice!2025 | Sales manager persona (USA) |
| Bob Nguyen    | bob.nguyen@contoso.onmicrosoft.com    | Bob!2025   | Support lead persona (APAC) |
| Charlie Kelly | charlie.kelly@contoso.onmicrosoft.com | Charlie!2025 | Executive demo persona |

Accounts live in the demo tenant, have `User.Read` + required app access, and can be reset anytime via the Entra portal. Update this table if passwords change so the OOBE guide stays accurate.

##### End-user flow after first run (2025‑12‑15T23:07:28.421Z)

1. **Sign in** – Charlie (or the kids) opens `https://eden-teams.kellzkreations.com`, signs in with one of the demo accounts above, and immediately sees the Home screen hero (“Ask about Teams calls…” plus example chips).
2. **Ask & view** – They click/enter a question (e.g., “Show me calls from last week”), hit **Ask**, and the UI returns a friendly summary card first (“You had 4 calls; 1 looked rough”) with a “See details” button revealing the table.
3. **Explore & wrap** – Optional: jump to **Call Explorer** for filters/timeline, then **Admin** to see health badges (“Managed identity ✅, Key Vault ✅”). Use the **Reset**/Back buttons to start over or swap users without refreshing.

##### First-run quick start (2025‑12‑15T23:12:28.182Z)

```powershell
# 1. Backend OOBE (shows banner + config warnings)
cd C:\Insider-Source\eden-teams.worktrees\worktree-2025-12-15T17-24-43
.venv\Scripts\activate
python -m eden_teams.main

# 2. UI OOBE (local)
cd C:\Insider-Source\eden-teams\ui\eden-teams-ui
npm install
npm run dev    # visit http://localhost:5173 (first-run hero, sample chips)

# 3. Demo sign-in
# Use one of the accounts above (e.g., alice.rivers@contoso.onmicrosoft.com / Alice!2025)
# either locally or at https://eden-teams.kellzkreations.com once DNS binding is healthy
```


#### React SPA scaffolding (shared core)

```bash
# 1. Create the project (TypeScript template)
npx create-react-app eden-teams-ui --template typescript
cd eden-teams-ui

# 2. Install Microsoft + Fluent dependencies
npm install @fluentui/react-components @azure/msal-browser @azure/msal-react @microsoft/teams-js axios

# 3. Dev server
npm start
```

Key files to add/update:

- `src/msalConfig.ts` – export MSAL configuration (clientId, authority, redirectURI) shared by standalone + Teams builds.
- `src/components/AppShell.tsx` – Fluent UI layout (left nav + top bar) hosting Home, Call Explorer, Admin routes.
- `src/pages/HomePage.tsx` – Query console with text area, date picker, People Picker, “Ask” button, results cards/table fed by `eden-api`.
- `src/api/client.ts` – Axios instance reading `process.env.REACT_APP_API_BASE` (point to `https://eden-api.redmushroom-...azurecontainerapps.io` or your custom domain).
- `src/auth/withAuth.tsx` – Higher-order component wrapping routes with MSAL `AuthenticatedTemplate`.

Set these environment variables for local development:

```bash
REACT_APP_API_BASE=https://localhost:7070   # or your tunneled eden-api
REACT_APP_AAD_CLIENT_ID=<spa-client-id>
REACT_APP_AAD_TENANT_ID=<tenant-id>
```

For Azure Static Web Apps or App Service, add the same variables as configuration settings and update the MSAL redirect URI to match the deployed hostname (plus `https://teamsui.kellzkreations.com` for Teams).

#### Teams app packaging (personal tab)

1. Host the built SPA at an HTTPS origin (e.g., `https://teamsui.kellzkreations.com`) and ensure MSAL redirect URI includes `/auth`.
2. Add Teams JS SDK initialization in your React app (e.g., wrap `App` with `TeamsFxProvider` or call `microsoftTeams.app.initialize()` in a `useEffect`).
3. Create a `teams/manifest.json` with:
   - `staticTabs` → `contentUrl`, `websiteUrl`, and `scopes: ["personal"]` pointing to your hosted SPA.
   - `webApplicationInfo` referencing the same AAD app used by MSAL (clientId + resource).
   - Icons (`color.png`, `outline.png`) at 192x192 and 32x32 in `/teams`.
4. Zip `manifest.json` + icons → `eden-teams-teamsapp.zip`, then side-load via Teams → Apps → Upload a custom app.
5. Once validated, publish to your org’s Teams app catalog so Charlie can run the demo directly inside Teams.

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

### Enterprise Readiness (C2 checklist)

- **Identity & access**: Use system-assigned managed identity for the Container App and grant least-privilege Graph permissions per environment.
- **Secrets & config**: Store Graph and OpenAI credentials in Azure Key Vault; reference them from the app using Key Vault references, not raw environment variables.
- **Data & compliance**: Decide retention for CDR data and LLM logs; avoid logging PII where possible and ensure data residency requirements are met.
- **Observability**: Enable Log Analytics / Application Insights, add basic dashboards, and set alerts for Graph/LLM failures and high latency.
- **Deployment & change**: Use Bicep/Terraform + CI/CD (e.g., GitHub Actions) for ACR, Container App, and Key Vault; consider blue-green or canary deployments for production.

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
