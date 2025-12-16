Deploy React/Vite UI to Azure Static Web Apps (SWA)

Prereqs
- az CLI logged in to correct subscription
- Node/npm installed; @azure/static-web-apps-cli installed (npx ok)
- App already builds to dist via npm run build

Targets (defaults used)
- Subscription: bf2dc682-be5b-4da7-91f2-1a6709ddc05b
- Resource group: eden-teams-rg (exists, eastus)
- Region: eastus (RG location)
- App name: eden-teams-ui
- Deployed URL: https://red-field-01c74191e.3.azurestaticapps.net

Build
- cd ui/eden-teams-ui
- npm install
- npm run build (outputs dist/)

Deploy (SWA CLI upload)
- cd ui/eden-teams-ui
- npx swa deploy --env production --app-name eden-teams-ui --resource-group eden-teams-rg --subscription-id bf2dc682-be5b-4da7-91f2-1a6709ddc05b
- Expect success URL: https://red-field-01c74191e.3.azurestaticapps.net

Post-deploy app settings (SWA portal → Configuration → Application settings)
- VITE_AAD_TENANT_ID = <tenant>
- VITE_AAD_CLIENT_ID = <client>
- VITE_AAD_REDIRECT_URI = https://red-field-01c74191e.3.azurestaticapps.net
- VITE_API_BASE = <backend API URL>

Verify
- Reload site and complete OOBE
- Confirm AAD login and API calls succeed

Optional GitHub Actions
- In SWA portal → Deployment Center → connect repo nkleven/eden-teams, branch master, app location ., output dist, build npm run build
