import type { ReactNode } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal
} from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { Button, Subtitle2 } from "@fluentui/react-components";

export const WithAuth = ({ children }: { children: ReactNode }) => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((error: unknown) => {
      console.error("MSAL login failed", error);
    });
  };

  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px"
          }}
        >
          <Subtitle2>Sign in with your Microsoft account to continue.</Subtitle2>
          <Button appearance="primary" onClick={handleLogin}>
            Sign in
          </Button>
        </div>
      </UnauthenticatedTemplate>
    </>
  );
};
