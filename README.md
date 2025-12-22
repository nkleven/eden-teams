# Eden Teams

Enterprise collaboration and team management platform with AI-powered insights.

## 🌟 Overview

Eden Teams provides a unified ecosystem for managing teams, workflows, and AI-powered analytics across your organization. This repository hosts multiple applications:

### 📊 **Edens Gate** - Unified Dashboard
**Location**: `apps/edens-gate`

A Microsoft Fluent UI-based control plane providing centralized access to all Eden services.

**Features**:
- 🎯 Unified dashboard with health metrics for all services
- 🔗 Direct links to production and local service instances
- 📈 Service-specific monitoring pages
- 🎨 Microsoft 365-style navigation
- ♿ Built-in accessibility and keyboard navigation

**Quick Start**:
```bash
cd apps/edens-gate
npm install
npm run dev
```
Visit http://localhost:3000

**Latest Release**: v4.0.1 ([CHANGELOG](apps/edens-gate/CHANGELOG.md))

### 🤝 **Eden Teams UI** - Legacy Interface
**Location**: `ui/eden-teams-ui`

Original team collaboration interface (Vite-based).

## 🏗️ Project Structure

```
eden-teams/
├── apps/
│   └── edens-gate/          # Unified dashboard (Next.js + Fluent UI)
├── ui/
│   └── eden-teams-ui/       # Legacy teams interface (Vite + React)
├── src/
│   └── eden_teams/          # Python backend services
└── tests/                   # Test suites
```

## 🚀 Eden Ecosystem

Edens Gate provides access to all Eden services:

| Service | Description | Production URL | Local Dev |
|---------|-------------|----------------|-----------|
| **Eden Worker** | Task processing & orchestration | TBD | `http://localhost:3000` |
| **Eden Prophet** | AI model training & predictions | [prophet.nwiss.net](https://prophet.nwiss.net) | `http://localhost:3000` |
| **Eden Teams** | Collaboration platform | [teams.kellskreations.com](https://teams.kellskreations.com) | `http://localhost:5173` |
| **Eden Market** | Data marketplace | TBD | `http://localhost:4000` |
| **Eden Shepard** | Service orchestration | [shep.nwis.co.in](https://shep.nwis.co.in) | `http://localhost:8000` |
| **Eden Exodus** | Data migration | TBD | `http://localhost:5173` |
| **Eden Genesis** | Workflow automation | [genesis.kellzkreations.com](https://genesis.kellzkreations.com) | Open `index.html` |
| **Eden Scroll Reader** | Document processing | TBD | `http://localhost:8080/ui` |

## 🛠️ Development

### Prerequisites
- Node.js 18+ (for frontend apps)
- Python 3.11+ (for backend services)
- npm or yarn

### Backend Services
```bash
# Activate virtual environment
.venv/Scripts/Activate.ps1  # Windows
source .venv/bin/activate     # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt

# Run services (varies by service)
python -m eden_teams.main
```

### Frontend Applications

**Edens Gate Dashboard**:
```bash
cd apps/edens-gate
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
npm run lint    # ESLint check
npm test        # Vitest tests
```

**Teams UI (Legacy)**:
```bash
cd ui/eden-teams-ui
npm install
npm run dev     # http://localhost:5173
```

## 📝 Environment Configuration

See individual app READMEs for specific configuration:
- [Edens Gate Environment Variables](apps/edens-gate/.env.example)
- [Teams UI Configuration](ui/eden-teams-ui/.env.example)

## 🧪 Testing

```bash
# Edens Gate tests
cd apps/edens-gate
npm test

# Python backend tests
pytest tests/
```

## 📚 Documentation

- [Edens Gate README](apps/edens-gate/README.md) - Dashboard documentation
- [Edens Gate CHANGELOG](apps/edens-gate/CHANGELOG.md) - Release notes
- [Service URLs Reference](apps/edens-gate/SERVICE_URLS.md) - All Eden service endpoints

## 🤝 Contributing

1. Create a feature branch from `master`
2. Make your changes with conventional commits
3. Run tests and linting: `npm run lint && npm test`
4. Submit a pull request

## 📄 License

MIT License - see individual project files for details

## 🔗 Links

- **Edens Gate Dashboard**: [GitHub Tag](https://github.com/nkleven/eden-teams/releases/tag/edens-gate-v4.0.1)
- **Eden Prophet**: https://prophet.nwiss.net
- **Eden Teams**: https://teams.kellskreations.com
- **Eden Genesis**: https://genesis.kellzkreations.com
- **Eden Shepard**: https://shep.nwis.co.in

---

**Product Key**: GYXP4-R9P92-VVGWJ-J37QK-KW74Z