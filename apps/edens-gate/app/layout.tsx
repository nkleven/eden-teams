import type { Metadata } from "next";
import { ClientProviders } from "@/src/components/providers/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edens Gate",
  description: "Unified UI/UX for Eden services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
