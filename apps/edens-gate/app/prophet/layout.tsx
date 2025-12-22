import { AppShell } from "@/src/components/shell/AppShell";

export default function ProphetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
