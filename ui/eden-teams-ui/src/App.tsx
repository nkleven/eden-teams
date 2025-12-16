import {
  FluentProvider,
  webLightTheme,
  Toaster,
  useId,
  Tooltip,
  Input,
  Button,
  Field,
  Spinner
} from "@fluentui/react-components";
import { Info16Regular, Copy16Regular, Checkmark16Regular, Settings16Regular } from "@fluentui/react-icons";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal
} from "@azure/msal-react";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import CallExplorerPage from "./pages/CallExplorerPage";
import AdminPage from "./pages/AdminPage";
import { loginRequest, isConfigured } from "./auth/msalConfig";
import "./styles.css";

// Storage key for runtime config
const CONFIG_STORAGE_KEY = "eden-teams-config";

// Sample data for tooltips - helps users understand the expected format
const SAMPLE_DATA = {
  tenantId: "72f988bf-86f1-41af-91ab-2d7cd011db47",
  clientId: "1950a258-227b-4e31-a9cf-717495945fc2",
  redirectUri: "http://localhost:5173",
  apiBase: "https://eden-api.redmushroom-c729ca5a.eastus2.azurecontainerapps.io"
};

interface RuntimeConfig {
  tenantId: string;
  clientId: string;
  redirectUri: string;
  apiBase: string;
}

// Get stored config from localStorage
function getStoredConfig(): RuntimeConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Save config to localStorage
function saveConfig(config: RuntimeConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

// Clear stored config
function clearConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

// Check if a value looks like a valid GUID
function isValidGuid(value: string): boolean {
  if (!value) return false;
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidPattern.test(value);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Tooltip content={copied ? "Copied!" : "Copy to clipboard"} relationship="label">
      <button className="copy-btn" onClick={handleCopy} aria-label="Copy">
        {copied ? <Checkmark16Regular /> : <Copy16Regular />}
      </button>
    </Tooltip>
  );
}

function ConfigurationRequired() {
  const [config, setConfig] = useState<RuntimeConfig>({
    tenantId: "",
    clientId: "",
    redirectUri: window.location.origin,
    apiBase: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load any existing stored config on mount
  useEffect(() => {
    const stored = getStoredConfig();
    if (stored) {
      setConfig(stored);
    }
  }, []);

  const handleInputChange = (field: keyof RuntimeConfig) => (
    _: unknown,
    data: { value: string }
  ) => {
    setConfig((prev) => ({ ...prev, [field]: data.value }));
    setSaved(false);
  };

  const handleUseSample = (field: keyof RuntimeConfig) => () => {
    const sampleValues: Record<keyof RuntimeConfig, string> = {
      tenantId: SAMPLE_DATA.tenantId,
      clientId: SAMPLE_DATA.clientId,
      redirectUri: SAMPLE_DATA.redirectUri,
      apiBase: SAMPLE_DATA.apiBase
    };
    setConfig((prev) => ({ ...prev, [field]: sampleValues[field] }));
    setSaved(false);
  };

  const handleSaveAndContinue = () => {
    setSaving(true);
    // Save to localStorage
    saveConfig(config);

    // Brief delay for UX feedback
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      // Reload the page to reinitialize MSAL with new config
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, 500);
  };

  const handleReset = () => {
    clearConfig();
    setConfig({
      tenantId: "",
      clientId: "",
      redirectUri: window.location.origin,
      apiBase: ""
    });
    setSaved(false);
  };

  const canSave = isValidGuid(config.tenantId) && isValidGuid(config.clientId);

  return (
    <div className="config-page">
      <div className="config-card">
        <div className="config-icon">🚀</div>
        <h1>Welcome to Eden Teams</h1>
        <p className="config-subtitle">
          Let's get you set up! Enter your Azure AD credentials to get started.
        </p>

        <div className="config-form">
          <Field
            label="Tenant ID"
            required
            hint="Found in Azure Portal → Entra ID → Overview"
            validationState={config.tenantId ? (isValidGuid(config.tenantId) ? "success" : "error") : "none"}
            validationMessage={config.tenantId && !isValidGuid(config.tenantId) ? "Must be a valid GUID format" : undefined}
          >
            <div className="input-with-sample">
              <Input
                value={config.tenantId}
                onChange={handleInputChange("tenantId")}
                placeholder={SAMPLE_DATA.tenantId}
                className="config-input"
              />
              <Tooltip content={`Use sample: ${SAMPLE_DATA.tenantId}`} relationship="label">
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Settings16Regular />}
                  onClick={handleUseSample("tenantId")}
                />
              </Tooltip>
            </div>
          </Field>

          <Field
            label="Client ID"
            required
            hint="Found in Azure Portal → App registrations → Your app → Overview"
            validationState={config.clientId ? (isValidGuid(config.clientId) ? "success" : "error") : "none"}
            validationMessage={config.clientId && !isValidGuid(config.clientId) ? "Must be a valid GUID format" : undefined}
          >
            <div className="input-with-sample">
              <Input
                value={config.clientId}
                onChange={handleInputChange("clientId")}
                placeholder={SAMPLE_DATA.clientId}
                className="config-input"
              />
              <Tooltip content={`Use sample: ${SAMPLE_DATA.clientId}`} relationship="label">
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Settings16Regular />}
                  onClick={handleUseSample("clientId")}
                />
              </Tooltip>
            </div>
          </Field>

          <div className="advanced-toggle">
            <Button
              appearance="transparent"
              size="small"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "▼ Hide" : "▶ Show"} Advanced Settings
            </Button>
          </div>

          {showAdvanced && (
            <div className="advanced-fields">
              <Field
                label="Redirect URI"
                hint="Must match your App Registration's redirect URI"
              >
                <div className="input-with-sample">
                  <Input
                    value={config.redirectUri}
                    onChange={handleInputChange("redirectUri")}
                    placeholder={SAMPLE_DATA.redirectUri}
                    className="config-input"
                  />
                  <Tooltip content={`Use sample: ${SAMPLE_DATA.redirectUri}`} relationship="label">
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<Settings16Regular />}
                      onClick={handleUseSample("redirectUri")}
                    />
                  </Tooltip>
                </div>
              </Field>

              <Field
                label="API Base URL"
                hint="Eden Teams backend API endpoint (optional)"
              >
                <div className="input-with-sample">
                  <Input
                    value={config.apiBase}
                    onChange={handleInputChange("apiBase")}
                    placeholder={SAMPLE_DATA.apiBase}
                    className="config-input"
                  />
                  <Tooltip content={`Use sample: ${SAMPLE_DATA.apiBase}`} relationship="label">
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<Settings16Regular />}
                      onClick={handleUseSample("apiBase")}
                    />
                  </Tooltip>
                </div>
              </Field>
            </div>
          )}

          <div className="config-actions">
            <Button
              appearance="primary"
              size="large"
              disabled={!canSave || saving}
              onClick={handleSaveAndContinue}
            >
              {saving ? <Spinner size="tiny" /> : saved ? "✓ Saved!" : "Save & Continue"}
            </Button>
            <Button
              appearance="subtle"
              size="medium"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

          {!canSave && (config.tenantId || config.clientId) && (
            <p className="config-validation-hint">
              <Info16Regular /> Both Tenant ID and Client ID must be valid GUIDs to continue.
            </p>
          )}
        </div>

        <div className="config-divider">
          <span>or configure manually</span>
        </div>

        <details className="config-manual">
          <summary>📁 Set up via .env file</summary>
          <div className="config-manual-content">
            <p>Create a <code>.env</code> file in <code>ui/eden-teams-ui/</code> with:</p>
            <div className="config-code template">
              <CopyButton text={`VITE_AAD_TENANT_ID=${config.tenantId || "<your-tenant-id>"}\nVITE_AAD_CLIENT_ID=${config.clientId || "<your-client-id>"}\nVITE_AAD_REDIRECT_URI=${config.redirectUri || "http://localhost:5173"}\nVITE_API_BASE=${config.apiBase || "https://your-api.azurecontainerapps.io"}`} />
              <code>VITE_AAD_TENANT_ID={config.tenantId || "<your-tenant-id>"}</code>
              <code>VITE_AAD_CLIENT_ID={config.clientId || "<your-client-id>"}</code>
              <code>VITE_AAD_REDIRECT_URI={config.redirectUri || "http://localhost:5173"}</code>
              <code>VITE_API_BASE={config.apiBase || "https://your-api.azurecontainerapps.io"}</code>
            </div>
            <p className="config-manual-note">Then restart the dev server with <code>npm run dev</code></p>
          </div>
        </details>

        <div className="config-help">
          <p>
            📖 Need help? See the{" "}
            <a
              href="https://github.com/nkleven/eden-teams#configuration"
              target="_blank"
              rel="noopener noreferrer"
            >
              setup guide
            </a>
          </p>
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
