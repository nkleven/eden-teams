import { AppShell } from "@/src/components/shell/AppShell";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
