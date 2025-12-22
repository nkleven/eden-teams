import { AppShell } from "@/src/components/shell/AppShell";
import { Dashboard } from "@/src/components/dashboard/Dashboard";

export default function Home() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
