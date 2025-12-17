import {
  FluentProvider,
  webLightTheme,
  Toaster,
  useId,
  Tooltip,
  Input,
  Button,
  Field,
  Spinner,
  Badge
} from "@fluentui/react-components";
import { Info16Regular, Copy16Regular, Checkmark16Regular } from "@fluentui/react-icons";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal
} from "@azure/msal-react";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "./components/AppShell";
import { loginRequest, isConfigured } from "./auth/msalConfig";
import "./styles.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const CallExplorerPage = lazy(() => import("./pages/CallExplorerPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

// Storage key for runtime config
const CONFIG_STORAGE_KEY = "eden-teams-config";

const getRedirectDefault = (): string => {
  const envRedirect = import.meta.env.VITE_AAD_REDIRECT_URI;
  if (envRedirect) {
    return envRedirect;
  }
  if (window.location.hostname === "localhost") {
    return "http://localhost:5173";
  }
  return window.location.origin;
};

const normalizeRedirectUri = (value: string): string => {
  if (!value) return value;
  if (window.location.hostname === "localhost" && value.startsWith("https://")) {
    return value.replace(/^https:\/\//i, "http://");
  }
  return value;
};

// Environment defaults - ONLY from env (avoid baking tenant/client IDs into the bundle)
const ENV_DEFAULTS: RuntimeConfig = {
  tenantId: import.meta.env.VITE_AAD_TENANT_ID || "",
  clientId: import.meta.env.VITE_AAD_CLIENT_ID || "",
  redirectUri: normalizeRedirectUri(getRedirectDefault()),
  apiBase: import.meta.env.VITE_API_BASE || ""
};

const SWA_URL = "https://red-field-01c74191e.3.azurestaticapps.net";
const CUSTOM_DOMAIN = "https://teams.kellskreations.com";

// Reject known sample or first-party IDs to avoid accidental misuse
const DISALLOWED_TENANTS = ["00000000-0000-0000-0000-000000000001"];
const DISALLOWED_CLIENTS = [
  "00000000-0000-0000-0000-000000000002",
  "1950a258-227a-4e31-a9cf-717495945fc2" // Microsoft first-party client often cached from samples
];

// Placeholder hints for input fields
const PLACEHOLDER_HINTS = {
  tenantId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  clientId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  redirectUri: "http://localhost:5173",
  apiBase: "https://your-api.azurecontainerapps.io"
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
      const parsed: RuntimeConfig = JSON.parse(stored);
      return {
        ...parsed,
        redirectUri: normalizeRedirectUri(parsed.redirectUri)
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

const truncate = (value: string, keep: number = 6) => {
  if (!value) return "";
  if (value.length <= keep * 2 + 1) return value;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
};

const isRuntimeConfigValid = (config: RuntimeConfig | null): boolean => {
  if (!config) return false;
  const tenantOk = isValidGuid(config.tenantId) && !isDisallowedTenant(config.tenantId);
  const clientOk = isValidGuid(config.clientId) && !isDisallowedClient(config.clientId);
  return tenantOk && clientOk;
};

function getActiveConfig(): RuntimeConfig {
  const stored = getStoredConfig();
  if (isRuntimeConfigValid(stored)) {
    return stored as RuntimeConfig;
  }
  return ENV_DEFAULTS;
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
  const candidate = value.trim();
  if (!candidate) return false;
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidPattern.test(candidate);
}

function isDisallowedTenant(value: string): boolean {
  return DISALLOWED_TENANTS.includes(value.trim().toLowerCase());
}

function isDisallowedClient(value: string): boolean {
  return DISALLOWED_CLIENTS.includes(value.trim().toLowerCase());
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
      <button
        type="button"
        className="copy-btn"
        onClick={handleCopy}
        aria-label="Copy"
      >
        {copied ? <Checkmark16Regular /> : <Copy16Regular />}
      </button>
    </Tooltip>
  );
}

function ConfigurationRequired() {
  const stored = getStoredConfig();
  const [config, setConfig] = useState<RuntimeConfig>(() => stored || ENV_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const envDefaultsValid = isRuntimeConfigValid(ENV_DEFAULTS);
  const tenantInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Focus the first input to reduce tabbing on first run.
    tenantInputRef.current?.focus();
  }, []);

  const handleInputChange = (field: keyof RuntimeConfig) => (
    _: unknown,
    data: { value: string }
  ) => {
    const value = data.value.trim();
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleFillEnvDefaults = () => {
    setConfig(ENV_DEFAULTS);
    setSaved(false);
  };

  const persistConfig = (pendingConfig: RuntimeConfig) => {
    setSaving(true);
    const normalizedConfig: RuntimeConfig = {
      ...pendingConfig,
      redirectUri: normalizeRedirectUri(pendingConfig.redirectUri)
    };

    // Save to localStorage
    saveConfig(normalizedConfig);
    setConfig(normalizedConfig);

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

  const handleSaveAndContinue = () => {
    if (!canSave) {
      return;
    }
    persistConfig(config);
  };

  const handleQuickStart = () => {
    if (!envDefaultsValid) {
      return;
    }
    persistConfig(ENV_DEFAULTS);
  };

  const handleReset = () => {
    clearConfig();
    setConfig(ENV_DEFAULTS);
    setSaved(false);
  };

  const tenantOk = isValidGuid(config.tenantId) && !isDisallowedTenant(config.tenantId.toLowerCase());
  const clientOk = isValidGuid(config.clientId) && !isDisallowedClient(config.clientId.toLowerCase());
  const canSave = tenantOk && clientOk;

  return (
    <div className="config-page">
      <div className="config-card">
        <div className="config-icon" aria-hidden="true">
          🚀
        </div>
        <h1>Welcome to Eden Teams</h1>
        <p className="config-subtitle">
          Let's get you set up! Enter your Azure AD credentials to get started.
        </p>

        {envDefaultsValid ? (
          <div className="config-quickstart" role="status" aria-live="polite">
            <strong>✅ You're almost done:</strong> Values are pre-filled from your environment. Just review and press <strong>Save & Continue</strong>.
          </div>
        ) : (
          <div className="config-quickstart" role="status" aria-live="polite">
            <strong>✅ Quick setup:</strong> Paste your Tenant ID + Client ID below and press <strong>Save & Continue</strong>.
          </div>
        )}

        <form
          className="config-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!saving && canSave) {
              handleSaveAndContinue();
            }
          }}
        >
          <Field
            label="Tenant ID"
            required
            hint="Found in Azure Portal → Entra ID → Overview"
            validationState={config.tenantId ? (isValidGuid(config.tenantId) ? "success" : "error") : "none"}
            validationMessage={
              config.tenantId && !isValidGuid(config.tenantId)
                ? "Must be a valid GUID format"
                : config.tenantId && isDisallowedTenant(config.tenantId)
                  ? "Do not use sample tenant IDs"
                  : undefined
            }
          >
            <Input
              ref={tenantInputRef}
              id="tenantId"
              value={config.tenantId}
              onChange={handleInputChange("tenantId")}
              placeholder={PLACEHOLDER_HINTS.tenantId}
              className="config-input"
            />
          </Field>

          <Field
            label="Client ID"
            required
            hint="Found in Azure Portal → App registrations → Your app → Overview"
            validationState={config.clientId ? (isValidGuid(config.clientId) ? "success" : "error") : "none"}
            validationMessage={
              config.clientId && !isValidGuid(config.clientId)
                ? "Must be a valid GUID format"
                : config.clientId && isDisallowedClient(config.clientId)
                  ? "Do not use sample or Microsoft first-party client IDs"
                  : undefined
            }
          >
            <Input
              id="clientId"
              value={config.clientId}
              onChange={handleInputChange("clientId")}
              placeholder={PLACEHOLDER_HINTS.clientId}
              className="config-input"
            />
          </Field>

          <div className="advanced-toggle">
            <Button
              appearance="transparent"
              size="small"
              type="button"
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
                <Input
                  value={config.redirectUri}
                  onChange={handleInputChange("redirectUri")}
                  placeholder={PLACEHOLDER_HINTS.redirectUri}
                  className="config-input"
                />
              </Field>

              <Field
                label="API Base URL"
                hint="Eden Teams backend API endpoint (optional)"
              >
                <Input
                  value={config.apiBase}
                  onChange={handleInputChange("apiBase")}
                  placeholder={PLACEHOLDER_HINTS.apiBase}
                  className="config-input"
                />
              </Field>
            </div>
          )}

          <div className="config-actions">
            <Button
              appearance="primary"
              size="large"
              disabled={!canSave || saving}
              type="submit"
            >
              {saving ? <Spinner size="tiny" /> : saved ? "✓ Saved!" : "Save & Continue"}
            </Button>
            <Button
              appearance="primary"
              size="medium"
              onClick={handleQuickStart}
              disabled={saving || !envDefaultsValid}
              type="button"
            >
              One-click Start
            </Button>
            <Button
              appearance="subtle"
              size="medium"
              onClick={handleReset}
              type="button"
            >
              Reset
            </Button>
            <Button
              appearance="secondary"
              size="medium"
              onClick={handleFillEnvDefaults}
              disabled={
                !ENV_DEFAULTS.tenantId || !ENV_DEFAULTS.clientId
              }
              type="button"
            >
              Use Env Defaults
            </Button>
          </div>

          <div className="config-status" aria-label="Configuration status">
            <div className={tenantOk ? "ok" : "warn"}>
              Tenant ID: {tenantOk ? "OK" : "Required"}
            </div>
            <div className={clientOk ? "ok" : "warn"}>
              Client ID: {clientOk ? "OK" : "Required"}
            </div>
            <div className="note">
              Saved values live in your browser (localStorage). "Save & Continue" reloads the app.
            </div>
          </div>

          {!canSave && (config.tenantId || config.clientId) && (
            <p className="config-validation-hint">
              <Info16Regular />
              {(!tenantOk || !clientOk)
                ? " Enter real Tenant and Client IDs (no samples or Microsoft first-party IDs)."
                : " Both Tenant ID and Client ID must be valid GUIDs to continue."}
            </p>
          )}
        </form>

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

        <details className="config-manual">
          <summary>🌐 Deployed on Azure Static Web Apps?</summary>
          <div className="config-manual-content">
            <p>Set these Application Settings in the Azure portal for your Static Web App:</p>
            <div className="config-code template">
              <code>VITE_AAD_TENANT_ID=&lt;your-tenant-id&gt;</code>
              <code>VITE_AAD_CLIENT_ID=&lt;your-client-id&gt;</code>
              <code>VITE_AAD_REDIRECT_URI=https://&lt;your-app&gt;.azurestaticapps.net</code>
              <code>VITE_API_BASE=https://&lt;your-api&gt;.azurecontainerapps.io</code>
            </div>
            <p className="config-manual-note">
              Note: Vite <code>VITE_*</code> values are baked in at build time. If you change SWA app settings,
              redeploy the UI (or use this wizard/runtime config). Reload the site to complete setup.
            </p>
          </div>
        </details>

        <div className="config-ha" aria-label="Production high availability checklist">
          <h4>Production / HA checklist</h4>
          <ul>
            <li>Front Door with custom domain in front of two Static Web Apps (two regions, health probes).</li>
            <li>API in two regions behind Front Door with a /health endpoint.</li>
            <li>Data with geo-replication (SQL active geo-rep or Cosmos multi-region) and zone redundancy where available.</li>
            <li>Entra redirect URIs for Front Door plus both regional SWA default URLs.</li>
            <li>App settings (VITE_*) set in both SWA instances and API instances.</li>
          </ul>
        </div>

        <div className="config-ha" aria-label="Bootstrap checklist">
          <h4>Bootstrap (first run)</h4>
          <ul>
            <li>App registration: add SPA redirect URIs for local (http://localhost:5173) and prod (https://red-field-01c74191e.3.azurestaticapps.net).</li>
            <li>Real IDs only: use your tenant GUID and client ID (no samples or Microsoft app IDs).</li>
            <li>Local env: set VITE_AAD_TENANT_ID, VITE_AAD_CLIENT_ID, VITE_AAD_REDIRECT_URI; restart dev server after edits.</li>
            <li>Cached config: if you ever see 1950a258-*, clear localStorage key eden-teams-config or use incognito.</li>
          </ul>
        </div>

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
        type="button"
        className="login-button"
        onClick={() => instance.loginPopup(loginRequest)}
      >
        Sign in with Microsoft
      </button>
    </div>
  );
}

function ConnectionStatusBar() {
  const config = getActiveConfig();
  const tenantDisplay = truncate(config.tenantId);
  const clientDisplay = truncate(config.clientId);

  const handleReset = () => {
    clearConfig();
    window.location.reload();
  };

  return (
    <div className="status-bar" role="status">
      <div className="status-pill">
        <Badge appearance="filled" color="brand" shape="rounded">Connected</Badge>
        <span>Tenant</span>
        <strong>{tenantDisplay}</strong>
      </div>
      <div className="status-pill">
        <Badge appearance="ghost" color="brand" shape="rounded">App</Badge>
        <span>Client ID</span>
        <strong>{clientDisplay}</strong>
      </div>
      <div className="status-pill">
        <Badge appearance="ghost" color="brand" shape="rounded">Redirect</Badge>
        <span>{config.redirectUri}</span>
      </div>
      <div className="status-actions">
        <Button size="small" appearance="secondary" onClick={handleReset}>
          Edit config
        </Button>
      </div>
    </div>
  );
}

function GuidedSteps() {
  const { accounts } = useMsal();
  const config = getActiveConfig();
  const steps = useMemo(
    () => [
      { label: "Sign in", done: accounts.length > 0 },
      { label: "Configure tenant", done: Boolean(config.tenantId && config.clientId) },
      { label: "Explore calls", done: false }
    ],
    [accounts.length, config.clientId, config.tenantId]
  );

  return (
    <div className="guided-steps" aria-label="Quick checklist">
      {steps.map((step) => (
        <div key={step.label} className={`guided-step ${step.done ? "done" : "todo"}`}>
          <Badge appearance={step.done ? "filled" : "ghost"} color={step.done ? "success" : "brand"}>
            {step.done ? "Done" : "Next"}
          </Badge>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

type HealthStatus = "checking" | "ok" | "fail";

function DeploymentDashboard({ show }: { show: boolean }) {
  const [swaStatus, setSwaStatus] = useState<HealthStatus>("checking");
  const [customStatus, setCustomStatus] = useState<HealthStatus>("checking");
  const [apiStatus, setApiStatus] = useState<HealthStatus>("checking");
  const config = getActiveConfig();

  useEffect(() => {
    const check = async (url: string, setStatus: (v: HealthStatus) => void) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch(url, { method: "HEAD", mode: "no-cors", signal: controller.signal });
        clearTimeout(timeout);
        setStatus("ok");
      } catch {
        setStatus("fail");
      }
    };

    check(SWA_URL, setSwaStatus);
    check(CUSTOM_DOMAIN, setCustomStatus);
    if (config.apiBase) {
      check(config.apiBase, setApiStatus);
    } else {
      setApiStatus("fail");
    }
  }, [config.apiBase]);

  if (!show) return null;

  const items = [
    {
      title: "Static Web App",
      status: swaStatus,
      detail: "Production deployed",
      link: SWA_URL
    },
    {
      title: "Custom domain",
      status: customStatus,
      detail: "teams.kellskreations.com",
      link: CUSTOM_DOMAIN
    },
    {
      title: "AAD redirects",
      status: "ok" as HealthStatus,
      detail: "Local + prod + custom domain"
    },
    {
      title: "API base",
      status: config.apiBase ? apiStatus : "fail",
      detail: config.apiBase || "Not provided"
    }
  ];

  const statusLabel = (status: HealthStatus) => {
    if (status === "checking") return "Checking";
    if (status === "ok") return "Healthy";
    return "Issue";
  };

  return (
    <div className="deploy-grid" aria-label="Deployment status">
      {items.map((item) => (
        <div key={item.title} className={`deploy-card status-${item.status}`}>
          <div className="deploy-header">
            <span className={`deploy-status status-${item.status}`}>{statusLabel(item.status)}</span>
            <strong>{item.title}</strong>
          </div>
          <div className="deploy-detail">
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer">{item.detail}</a>
            ) : (
              <span>{item.detail}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuthenticatedApp() {
  const toasterId = useId("toaster");
  const hasRuntimeConfig = isRuntimeConfigValid(getStoredConfig());
  return (
    <>
      <Toaster toasterId={toasterId} />
      <AppShell>
        <ConnectionStatusBar />
        <GuidedSteps />
        <DeploymentDashboard show={hasRuntimeConfig} />
        <Suspense
          fallback={
            <div className="route-loading">
              <Spinner label="Loading experience..." />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage toasterId={toasterId} />} />
            <Route path="/calls" element={<CallExplorerPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </>
  );
}

function App() {
  const hasRuntimeConfig = isRuntimeConfigValid(getStoredConfig());
  // Show configuration page if AAD is not properly configured
  if (!isConfigured && !hasRuntimeConfig) {
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
