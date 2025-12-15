import {
  FluentProvider,
  webLightTheme,
  Toaster,
  useId,
  Tooltip
} from "@fluentui/react-components";
import { Info16Regular, Copy16Regular } from "@fluentui/react-icons";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal
} from "@azure/msal-react";
import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import CallExplorerPage from "./pages/CallExplorerPage";
import AdminPage from "./pages/AdminPage";
import { loginRequest, isConfigured } from "./auth/msalConfig";
import "./styles.css";

// Sample data for tooltips - helps users understand the expected format
const SAMPLE_DATA = {
  tenantId: "72f988bf-86f1-41af-91ab-2d7cd011db47",
  clientId: "1950a258-227b-4e31-a9cf-717495945fc2", 
  redirectUri: "http://localhost:5173",
  apiBase: "https://eden-api.redmushroom-c729ca5a.eastus2.azurecontainerapps.io"
};

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };
  return (
    <Tooltip content="Copy to clipboard" relationship="label">
      <button className="copy-btn" onClick={handleCopy} aria-label="Copy">
        <Copy16Regular />
      </button>
    </Tooltip>
  );
}

function ConfigurationRequired() {
  return (
    <div className="config-page">
      <div className="config-card">
        <div className="config-icon">⚙️</div>
        <h1>Configuration Required</h1>
        <p className="config-subtitle">
          Eden Teams needs Azure AD credentials to authenticate users.
        </p>

        <div className="config-steps">
          <h3>Setup Instructions</h3>
          <ol>
            <li>
              <strong>Create an Azure AD App Registration</strong>
              <span>Go to Azure Portal → Entra ID → App registrations → New registration</span>
            </li>
            <li>
              <strong>Configure the redirect URI</strong>
              <span>Add <code>http://localhost:5173</code> as a Single-page application redirect</span>
            </li>
            <li>
              <strong>Copy your credentials</strong>
              <span>Note the Application (client) ID and Directory (tenant) ID</span>
            </li>
            <li>
              <strong>Create a <code>.env</code> file</strong>
              <span>In <code>ui/eden-teams-ui/</code>, copy <code>.env.example</code> to <code>.env</code></span>
            </li>
            <li>
              <strong>Set the environment variables</strong>
              <div className="config-code">
                <code>VITE_AAD_TENANT_ID=your-actual-tenant-guid</code>
                <code>VITE_AAD_CLIENT_ID=your-actual-client-guid</code>
                <code>VITE_AAD_REDIRECT_URI=http://localhost:5173</code>
              </div>
            </li>
            <li>
              <strong>Restart the dev server</strong>
              <span>Run <code>npm run dev</code> again</span>
            </li>
          </ol>
        </div>

        <div className="config-help">
          <p>
            📖 See the{" "}
            <a
              href="https://github.com/nkleven/eden-teams#configuration"
              target="_blank"
              rel="noopener noreferrer"
            >
              README
            </a>{" "}
            for detailed setup instructions.
          </p>
        </div>

        <div className="config-current">
          <h4>Environment Variables</h4>
          <p className="config-hint">
            <Info16Regular /> Hover over sample values for format examples. Click copy to use as template.
          </p>
          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Current Value</th>
                <th>Sample</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>VITE_AAD_TENANT_ID</td>
                <td className={import.meta.env.VITE_AAD_TENANT_ID && !import.meta.env.VITE_AAD_TENANT_ID.includes("your-") ? "set" : "missing"}>
                  {import.meta.env.VITE_AAD_TENANT_ID || "❌ Not set"}
                </td>
                <td>
                  <Tooltip 
                    content={
                      <div className="tooltip-content">
                        <strong>Directory (tenant) ID</strong>
                        <p>Found in Azure Portal → Entra ID → Overview</p>
                        <code>{SAMPLE_DATA.tenantId}</code>
                      </div>
                    } 
                    relationship="description"
                  >
                    <span className="sample-value">{SAMPLE_DATA.tenantId.slice(0, 8)}...</span>
                  </Tooltip>
                  <CopyButton text={`VITE_AAD_TENANT_ID=${SAMPLE_DATA.tenantId}`} />
                </td>
              </tr>
              <tr>
                <td>VITE_AAD_CLIENT_ID</td>
                <td className={import.meta.env.VITE_AAD_CLIENT_ID && !import.meta.env.VITE_AAD_CLIENT_ID.includes("your-") ? "set" : "missing"}>
                  {import.meta.env.VITE_AAD_CLIENT_ID || "❌ Not set"}
                </td>
                <td>
                  <Tooltip 
                    content={
                      <div className="tooltip-content">
                        <strong>Application (client) ID</strong>
                        <p>Found in Azure Portal → App registrations → Your app → Overview</p>
                        <code>{SAMPLE_DATA.clientId}</code>
                      </div>
                    } 
                    relationship="description"
                  >
                    <span className="sample-value">{SAMPLE_DATA.clientId.slice(0, 8)}...</span>
                  </Tooltip>
                  <CopyButton text={`VITE_AAD_CLIENT_ID=${SAMPLE_DATA.clientId}`} />
                </td>
              </tr>
              <tr>
                <td>VITE_AAD_REDIRECT_URI</td>
                <td className={import.meta.env.VITE_AAD_REDIRECT_URI ? "set" : "optional"}>
                  {import.meta.env.VITE_AAD_REDIRECT_URI || "⚡ Using default"}
                </td>
                <td>
                  <Tooltip 
                    content={
                      <div className="tooltip-content">
                        <strong>Redirect URI</strong>
                        <p>Must match your App Registration's redirect URI</p>
                        <code>{SAMPLE_DATA.redirectUri}</code>
                      </div>
                    } 
                    relationship="description"
                  >
                    <span className="sample-value">{SAMPLE_DATA.redirectUri}</span>
                  </Tooltip>
                  <CopyButton text={`VITE_AAD_REDIRECT_URI=${SAMPLE_DATA.redirectUri}`} />
                </td>
              </tr>
              <tr>
                <td>VITE_API_BASE</td>
                <td className={import.meta.env.VITE_API_BASE ? "set" : "optional"}>
                  {import.meta.env.VITE_API_BASE || "⚠️ Not set (optional)"}
                </td>
                <td>
                  <Tooltip 
                    content={
                      <div className="tooltip-content">
                        <strong>Backend API URL</strong>
                        <p>The Eden Teams API endpoint (Azure Container App)</p>
                        <code>{SAMPLE_DATA.apiBase}</code>
                      </div>
                    } 
                    relationship="description"
                  >
                    <span className="sample-value">https://eden-api...</span>
                  </Tooltip>
                  <CopyButton text={`VITE_API_BASE=${SAMPLE_DATA.apiBase}`} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="config-quickstart">
          <h4>Quick Start .env Template</h4>
          <p>Copy this template and replace with your actual values:</p>
          <div className="config-code template">
            <CopyButton text={`VITE_AAD_TENANT_ID=<your-tenant-id>\nVITE_AAD_CLIENT_ID=<your-client-id>\nVITE_AAD_REDIRECT_URI=http://localhost:5173\nVITE_API_BASE=https://your-api.azurecontainerapps.io`} />
            <code>VITE_AAD_TENANT_ID=&lt;your-tenant-id&gt;</code>
            <code>VITE_AAD_CLIENT_ID=&lt;your-client-id&gt;</code>
            <code>VITE_AAD_REDIRECT_URI=http://localhost:5173</code>
            <code>VITE_API_BASE=https://your-api.azurecontainerapps.io</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { instance } = useMsal();
  return (
    <div className="login-page">
      <h1>Eden Teams</h1>
      <p>Microsoft Teams CDR Assistant</p>
      <button
        className="login-button"
        onClick={() => instance.loginPopup(loginRequest)}
      >
        Sign in with Microsoft
      </button>
    </div>
  );
}

function AuthenticatedApp() {
  const toasterId = useId("toaster");
  return (
    <>
      <Toaster toasterId={toasterId} />
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage toasterId={toasterId} />} />
          <Route path="/calls" element={<CallExplorerPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AppShell>
    </>
  );
}

function App() {
  // Show configuration page if AAD is not properly configured
  if (!isConfigured) {
    return (
      <FluentProvider theme={webLightTheme}>
        <ConfigurationRequired />
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <AuthenticatedTemplate>
        <AuthenticatedApp />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </FluentProvider>
  );
}

export default App
