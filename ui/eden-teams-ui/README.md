# Eden Teams UI

React SPA for Eden Teams.

## Dev

- Install: `npm install`
- Run: `npm run dev`
- Build: `npm run build`

## E2E (Playwright)

The UI includes Playwright smoke tests that can run in Chromium by default or in Edge Canary.

- Install browser binaries: `npm run e2e:install`
- Run (headless): `npm run e2e`
- Run (headed): `npm run e2e:headed`

### Edge Canary

Set `EDGE_CANARY_PATH` to your Edge Canary executable and run the suite.

PowerShell example:

```powershell
$env:EDGE_CANARY_PATH = "$env:LOCALAPPDATA\Microsoft\Edge SxS\Application\msedge.exe"
npm run e2e:headed
```

Notes:

- Tests live in `tests/e2e/`.
- The harness starts `vite dev` automatically via `playwright.config.ts`.
