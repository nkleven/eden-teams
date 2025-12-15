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
import { loginRequest } from "./auth/msalConfig";
import "./styles.css";

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
