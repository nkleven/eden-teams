"use client";

import { useState } from "react";
import {
  makeStyles,
  shorthands,
  tokens as fluentTokens,
  Button,
  Title3,
  Body1,
  Hamburger,
} from "@fluentui/react-components";
import {
  HomeRegular,
  DataUsageRegular,
  PeopleRegular,
  ChartMultipleRegular,
  CloudRegular,
  SettingsRegular,
  Navigation20Regular,
} from "@fluentui/react-icons";
import { NavDrawer } from "./NavDrawer";

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "100vh",
    width: "100%",
    ...shorthands.overflow("hidden"),
  },
  appBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "48px",
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("0", "16px"),
    backgroundColor: fluentTokens.colorBrandBackground,
    color: fluentTokens.colorNeutralForegroundOnBrand,
    boxShadow: fluentTokens.shadow4,
    zIndex: 1000,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    fontWeight: 600,
  },
  content: {
    marginTop: "48px",
    marginLeft: "0",
    ...shorthands.flex(1),
    ...shorthands.overflow("auto"),
    ...shorthands.padding("24px"),
    backgroundColor: fluentTokens.colorNeutralBackground3,
    transition: "margin-left 0.2s ease",
  },
  contentShifted: {
    marginLeft: "240px",
  },
});

export interface AppShellProps {
  children: React.ReactNode;
}

export const navItems = [
  { icon: HomeRegular, label: "Home", href: "/", external: false },
  { icon: DataUsageRegular, label: "Worker", href: "/worker", external: false, appUrl: "http://localhost:3000" },
  { icon: PeopleRegular, label: "Teams", href: "/teams", external: false, appUrl: "https://teams.kellskreations.com" },
  { icon: ChartMultipleRegular, label: "Prophet", href: "/prophet", external: false, appUrl: "https://prophet.nwiss.net" },
  { icon: CloudRegular, label: "Market", href: "/market", external: false, appUrl: "http://localhost:4000" },
  { icon: Navigation20Regular, label: "Shepard", href: "/shepard", external: false, appUrl: "https://shep.nwis.co.in" },
  { icon: SettingsRegular, label: "Exodus", href: "/exodus", external: false, appUrl: "http://localhost:5173" },
];

export function AppShell({ children }: AppShellProps) {
  const styles = useStyles();
  const [navOpen, setNavOpen] = useState(true);

  return (
    <div className={styles.root}>
      <div className={styles.appBar}>
        <Hamburger onClick={() => setNavOpen(!navOpen)} />
        <div className={styles.logo}>
          <Title3>Edens Gate</Title3>
        </div>
      </div>

      <NavDrawer open={navOpen} items={navItems} />

      <main
        className={`${styles.content} ${navOpen ? styles.contentShifted : ""}`}
      >
        {children}
      </main>
    </div>
  );
}
