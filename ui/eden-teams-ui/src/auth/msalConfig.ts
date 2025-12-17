// Storage key for runtime config (matches App.tsx)
const CONFIG_STORAGE_KEY = "eden-teams-config";

// Disallow known sample/first-party IDs that cause AADSTS errors
const DISALLOWED_TENANTS = ["00000000-0000-0000-0000-000000000001"];
const DISALLOWED_CLIENTS = [
  "00000000-0000-0000-0000-000000000002",
  "1950a258-227a-4e31-a9cf-717495945fc2"
];

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

// Normalize redirect URIs to avoid https://localhost mismatches (AAD requires http on localhost)
const normalizeRedirectUri = (uri: string | undefined): string => {
  if (!uri) return window.location.origin;
  try {
    const url = new URL(uri);
    if (url.hostname === "localhost") {
      url.protocol = "http:";
      if (!url.port) {
        url.port = "5173"; // default Vite dev port
      }
    }
    // Trim trailing slash for consistency
    return url.toString().replace(/\/$/, "");
  } catch {
    return window.location.origin;
  }
};

// Priority: localStorage (runtime) > environment variables > defaults
const tenantId = runtimeConfig?.tenantId || import.meta.env.VITE_AAD_TENANT_ID;
const clientId = runtimeConfig?.clientId || import.meta.env.VITE_AAD_CLIENT_ID;
const rawRedirectUri = runtimeConfig?.redirectUri || import.meta.env.VITE_AAD_REDIRECT_URI || window.location.origin;
const redirectUri = normalizeRedirectUri(rawRedirectUri);

// Check if credentials are properly configured (not placeholder values)
const isDisallowedTenant = (value: string | undefined): boolean => {
  return value ? DISALLOWED_TENANTS.includes(value.trim().toLowerCase()) : false;
};

const isDisallowedClient = (value: string | undefined): boolean => {
  return value ? DISALLOWED_CLIENTS.includes(value.trim().toLowerCase()) : false;
};

const isValidGuid = (value: string | undefined, disallow: (v: string | undefined) => boolean): boolean => {
  if (!value) return false;
  if (value.includes("your-") || value === "common") return false;
  if (disallow(value)) return false;
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidPattern.test(value);
};

export const isConfigured =
  isValidGuid(clientId, isDisallowedClient) && isValidGuid(tenantId, isDisallowedTenant);

if (!isConfigured) {
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
