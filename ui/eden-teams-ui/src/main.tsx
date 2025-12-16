import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig, isConfigured } from "./auth/msalConfig";
import App from "./App";
import "./index.css";

// Only initialize MSAL if we have valid configuration
// This prevents errors when showing the first-run configuration page
const msalInstance = isConfigured
  ? new PublicClientApplication(msalConfig)
  : null;

function Root() {
  // If MSAL is not configured, render App without MsalProvider
  // App.tsx will detect this and show the configuration wizard
  if (!msalInstance) {
    return (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MsalProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
