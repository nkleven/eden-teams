# Edens Gate

Unified UI/UX for the Eden ecosystem.

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Radix UI** for accessible primitives
- **TanStack Query** for data fetching
- **Vitest + Testing Library** for testing

## Project Structure

```
app/              Next.js app router pages
src/
  components/     Reusable UI components
  lib/           Utilities, API clients, config
  hooks/         Custom React hooks
```

## Environment Variables

Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_API_BASE` - Base URL for Eden APIs
- `NEXT_PUBLIC_API_VERSION` - API version (e.g., 2024-01-01)
- `NEXT_PUBLIC_APP_NAME` - App identifier for telemetry
