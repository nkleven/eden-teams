# Changelog

All notable changes to Edens Gate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [4.0.2] - 2025-01-18

### Changed
- 📚 Comprehensive README updates for both root repository and Edens Gate app
- 📝 Enhanced documentation with project structure, Eden ecosystem overview, and service table
- 🔗 Added quick reference links to all production Eden services
- 🛠️ Improved development setup instructions
- ✨ Better onboarding experience for new contributors
## [4.0.1] - 2025-12-22

### Added
- **Microsoft Fluent UI Design System**: Integrated Fluent UI React v9 with custom Eden brand theme
- **Unified Dashboard**: Central control plane showing health metrics and status for all Eden services
- **Service Navigation**: Left sidebar with collapsible navigation to all Eden services
- **External App Links**: Direct links to production and local instances of all Eden services
  - Eden Worker (http://localhost:3000)
  - Eden Prophet (https://prophet.nwiss.net)
  - Eden Teams (https://teams.kellskreations.com)
  - Eden Shepard (https://shep.nwis.co.in)
  - Eden Genesis (https://genesis.kellzkreations.com)
  - Eden Market, Exodus, and Scroll Reader (local development)
- **Service-Specific Pages**: Dedicated pages for Worker, Teams, and Prophet with DataGrid components
- **Custom Brand Theming**: Iris/purple Eden color palette with light theme (dark theme ready)
- **Microsoft 365-Style Shell**: Top AppBar with hamburger menu and responsive layout
- **Accessibility Features**: Built-in ARIA labels, keyboard navigation, and focus management

### Technical
- Next.js 15.1.3 with App Router
- TypeScript with strict type checking
- Tailwind CSS for utility styling
- Vitest + React Testing Library for testing
- Client-side provider pattern for Fluent UI integration
- Server/Client component separation following Next.js best practices

### Fixed
- Server/client boundary issues with FluentProvider
- Type safety improvements throughout codebase
- ESLint clean with zero warnings or errors

### Documentation
- README with quick start guide
- SERVICE_URLS reference document
- Environment variable examples

---

## [4.0.0] - 2025-12-22

### Initial Release
- Project scaffolding with Next.js, TypeScript, and Tailwind CSS
- Basic routing structure
- Development environment setup
