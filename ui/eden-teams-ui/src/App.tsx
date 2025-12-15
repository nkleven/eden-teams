import {
  FluentProvider,
  webLightTheme,
  Toaster,
  useId
} from "@fluentui/react-components";
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
          <h4>Current Values (from .env)</h4>
          <table>
            <tbody>
              <tr>
                <td>VITE_AAD_TENANT_ID</td>
                <td className={import.meta.env.VITE_AAD_TENANT_ID ? "set" : "missing"}>
                  {import.meta.env.VITE_AAD_TENANT_ID || "❌ Not set"}
                </td>
              </tr>
              <tr>
                <td>VITE_AAD_CLIENT_ID</td>
                <td className={import.meta.env.VITE_AAD_CLIENT_ID ? "set" : "missing"}>
                  {import.meta.env.VITE_AAD_CLIENT_ID || "❌ Not set"}
                </td>
              </tr>
              <tr>
                <td>VITE_API_BASE</td>
                <td className={import.meta.env.VITE_API_BASE ? "set" : "missing"}>
                  {import.meta.env.VITE_API_BASE || "⚠️ Not set (optional)"}
                </td>
              </tr>
            </tbody>
          </table>
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
