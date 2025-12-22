"use client";

import { FluentProvider } from "@fluentui/react-components";
import { lightTheme } from "@/src/lib/theme/tokens";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <FluentProvider theme={lightTheme}>{children}</FluentProvider>;
}
