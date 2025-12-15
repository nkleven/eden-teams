const tenantId = import.meta.env.VITE_AAD_TENANT_ID;
const clientId = import.meta.env.VITE_AAD_CLIENT_ID;
const redirectUri =
  import.meta.env.VITE_AAD_REDIRECT_URI || window.location.origin;

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
    "⚠️ MSAL not configured. Set VITE_AAD_CLIENT_ID and VITE_AAD_TENANT_ID in .env file.\n" +
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
