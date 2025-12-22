# Edens Gate

Unified UI/UX dashboard for the Eden ecosystem.

## 🌟 Overview

Edens Gate is a Microsoft Fluent UI-based control plane providing centralized access to all Eden services. Built with Next.js 15, TypeScript, and Fluent UI React v9, it offers a modern, accessible interface for monitoring and managing the entire Eden platform.

## ✨ Features

- **Unified Dashboard**: Real-time health metrics and status for all Eden services
- **Service Navigation**: Microsoft 365-style collapsible sidebar with quick access
- **External Links**: Direct access to production and local service instances
- **Service Pages**: Dedicated monitoring pages for Worker, Teams, and Prophet with DataGrid components
- **Custom Theming**: Eden brand colors (iris/purple palette) with light/dark theme support
- **Accessibility**: Built-in ARIA labels, keyboard navigation, and screen reader support
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test          # Run Vitest tests
npm run lint      # ESLint check
```

## 🏗️ Tech Stack

- **Framework**: Next.js 15.1.3 (App Router)
- **Language**: TypeScript 5+
- **UI Library**: Fluent UI React v9
- **Styling**: Tailwind CSS + Fluent design tokens
- **Data Fetching**: TanStack Query
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Next.js config

## 📁 Project Structure

```
edens-gate/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with FluentProvider
│   ├── page.tsx           # Home dashboard
│   ├── worker/            # Worker service page
│   ├── teams/             # Teams service page
│   └── prophet/           # Prophet service page
├── src/
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   ├── shell/         # AppShell, NavDrawer
│   │   └── providers/     # Client-side providers
│   └── lib/
│       ├── theme/         # Fluent UI theme & tokens
│       ├── api/           # API client utilities
│       └── config.ts      # App configuration
├── public/                # Static assets
└── tests/                 # Test files
```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_BASE=https://api.example.com
NEXT_PUBLIC_API_VERSION=2024-01-01
NEXT_PUBLIC_APP_NAME=edens-gate
```

### Service URLs

All Eden service URLs are configured in [SERVICE_URLS.md](SERVICE_URLS.md). Update these to match your deployment:

- Eden Worker: http://localhost:3000
- Eden Prophet: https://prophet.nwiss.net
- Eden Teams: https://teams.kellskreations.com
- Eden Shepard: https://shep.nwis.co.in
- Eden Genesis: https://genesis.kellzkreations.com
- Eden Market, Exodus, Scroll Reader: Local development

## 🎨 Theming

Edens Gate uses a custom Fluent UI theme with Eden brand colors:

```typescript
// src/lib/theme/tokens.ts
const edenBrand: BrandVariants = {
  // Iris/purple palette
  10: "#050308",
  60: "#5729 8D",
  110: "#B88BF7",
  // ... full palette
};
```

To switch themes, update the provider in `src/components/providers/ClientProviders.tsx`:

```tsx
import { darkTheme } from "@/src/lib/theme/tokens";

<FluentProvider theme={darkTheme}>
```

## 🔗 Eden Services

Edens Gate provides access to:

| Service | Description | URL |
|---------|-------------|-----|
| Worker | Distributed task processing | http://localhost:3000 |
| Prophet | AI model training & predictions | https://prophet.nwiss.net |
| Teams | Collaboration platform | https://teams.kellskreations.com |
| Market | Data marketplace | http://localhost:4000 |
| Shepard | Service orchestration | https://shep.nwis.co.in |
| Exodus | Data migration | http://localhost:5173 |
| Genesis | Workflow automation | https://genesis.kellzkreations.com |
| Scroll Reader | Document processing | http://localhost:8080/ui |

## 🧪 Testing

### Unit Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

### Linting

```bash
npm run lint          # ESLint check
npm run lint -- --fix # Auto-fix issues
```

### Type Checking

```bash
npx tsc --noEmit      # TypeScript check
```

## 📦 Building

### Development

```bash
npm run dev           # Start dev server (http://localhost:3000)
```

### Production

```bash
npm run build         # Create optimized build
npm start             # Start production server
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🚢 Deployment

### Azure Static Web Apps

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Configure environment variables in Azure Portal

### Vercel

```bash
npm i -g vercel
vercel --prod
```

### Docker

```bash
docker build -t edens-gate .
docker run -p 3000:3000 edens-gate
```

## 🐛 Troubleshooting

### Server/Client Boundary Issues

If you see "canUseDOM() from the server" errors:
- Ensure FluentProvider is wrapped in a `"use client"` component
- Check that all Fluent UI components are in client components

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Cache Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📚 Documentation

- [CHANGELOG](CHANGELOG.md) - Release notes and version history
- [SERVICE_URLS](SERVICE_URLS.md) - Eden service endpoints reference
- [Fluent UI Docs](https://react.fluentui.dev/) - Component library documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes with conventional commits
3. Run tests: `npm test && npm run lint`
4. Submit a pull request

### Commit Convention

```
feat: add dark mode toggle
fix: resolve navigation link issue
docs: update README with deployment steps
style: format code with prettier
refactor: simplify dashboard component
test: add tests for NavDrawer
chore: update dependencies
```

## 📄 License

MIT License

## 🔗 Links

- **Repository**: https://github.com/nkleven/eden-teams
- **Latest Release**: [v4.0.1](https://github.com/nkleven/eden-teams/releases/tag/edens-gate-v4.0.1)
- **Issues**: https://github.com/nkleven/eden-teams/issues

---

Built with ❤️ by the Eden team
