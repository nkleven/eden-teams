import { AppShell } from "@/src/components/shell/AppShell";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
