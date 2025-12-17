# Eden Teams Release Notes

## v2025.12.16-christmas

- Added onboarding guardrails: blocks Microsoft sample/first-party client IDs (1950a258-*) and sample tenant IDs to prevent AADSTS65002/tenant errors.
- Bootstrap wizard includes HA and first-run checklist; tenant default baked in for CSAs.
- Production SWA updated: https://red-field-01c74191e.3.azurestaticapps.net
- Tag pushed: v2025.12.16-christmas

### CSA quickstart
1. Open the app and click Reset in the wizard.
2. Enter real values:
   - Tenant ID: 5f3c1aa9-26ac-4a91-9b3c-e9ad544ba967
   - Client ID: your SPA app registration ID
   - Redirect URI: must match your app registration (prod URL above for deployed use; http://localhost:5173 for local dev).
3. Save & Continue (wizard blocks samples/1950a258), then sign in.
4. If samples reappear, clear localStorage key `eden-teams-config` or use an incognito window.

### Local development
```
cd ui/eden-teams-ui
npm install
npm run dev
# ensure .env has real tenant/client/redirect
```

### Notes
- Vite build reports a >500 kB chunk warning; no functional impact.
- MSAL initialization now fails fast if disallowed IDs are present.
