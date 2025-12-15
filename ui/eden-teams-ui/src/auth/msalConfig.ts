const tenantId =
  import.meta.env.VITE_AAD_TENANT_ID || process.env.REACT_APP_AAD_TENANT_ID;
const clientId =
  import.meta.env.VITE_AAD_CLIENT_ID || process.env.REACT_APP_AAD_CLIENT_ID;
const redirectUri =
  import.meta.env.VITE_AAD_REDIRECT_URI ||
  process.env.REACT_APP_AAD_REDIRECT_URI ||
  window.location.origin;

if (!clientId || !tenantId) {
  // eslint-disable-next-line no-console
  console.warn(
    "MSAL client or tenant ID missing. Set VITE_AAD_CLIENT_ID and VITE_AAD_TENANT_ID."
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
