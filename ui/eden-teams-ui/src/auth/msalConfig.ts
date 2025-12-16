// Storage key for runtime config (matches App.tsx)
const CONFIG_STORAGE_KEY = "eden-teams-config";

// Try to get config from localStorage first (runtime config from OOBE)
function getRuntimeConfig(): { tenantId?: string; clientId?: string; redirectUri?: string } | null {
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

const runtimeConfig = getRuntimeConfig();

// Priority: localStorage (runtime) > environment variables > defaults
const tenantId = runtimeConfig?.tenantId || import.meta.env.VITE_AAD_TENANT_ID;
const clientId = runtimeConfig?.clientId || import.meta.env.VITE_AAD_CLIENT_ID;
const redirectUri =
  runtimeConfig?.redirectUri || import.meta.env.VITE_AAD_REDIRECT_URI || window.location.origin;

// Check if credentials are properly configured (not placeholder values)
const isValidGuid = (value: string | undefined): boolean => {
  if (!value) return false;
  // Check it's not a placeholder
  if (value.includes("your-") || value === "common") return false;
  // Basic GUID format check
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidPattern.test(value);
};

export const isConfigured = isValidGuid(clientId) && isValidGuid(tenantId);

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "⚠️ MSAL not configured. Enter credentials in the setup wizard or set VITE_AAD_CLIENT_ID and VITE_AAD_TENANT_ID in .env file.\n" +
    "See: ui/eden-teams-ui/.env.example"
  );
}

export const msalConfig = {
  auth: {
    clientId: clientId ?? "00000000-0000-0000-0000-000000000000",
    authority: `https://login.microsoftonline.com/${tenantId ?? "common"}`,
    redirectUri
  },
  cache: {
    cacheLocation: "sessionStorage" as const,
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: ["User.Read"]
};
