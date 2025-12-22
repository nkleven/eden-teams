"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  makeStyles,
  shorthands,
  tokens as fluentTokens,
} from "@fluentui/react-components";
import { OpenRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  drawer: {
    position: "fixed",
    top: "48px",
    left: "0",
    bottom: "0",
    width: "240px",
    backgroundColor: fluentTokens.colorNeutralBackground1,
    boxShadow: fluentTokens.shadow8,
    ...shorthands.transition("transform", "0.2s", "ease"),
    transform: "translateX(0)" as any,
    zIndex: "900" as any,
  },
  drawerClosed: {
    transform: "translateX(-240px)" as any,
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    ...shorthands.padding("8px"),
    ...shorthands.gap("4px"),
  },
  navItem: {
    display: "flex",
    alignItems: "center" as const,
    ...shorthands.gap("12px"),
    ...shorthands.padding("10px", "12px"),
    ...shorthands.borderRadius(fluentTokens.borderRadiusMedium),
    color: fluentTokens.colorNeutralForeground1,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "400" as any,
    cursor: "pointer",
    ...shorthands.transition("background-color", "0.1s", "ease"),
    ":hover": {
      backgroundColor: fluentTokens.colorNeutralBackground1Hover,
    },
  },
  navItemActive: {
    backgroundColor: fluentTokens.colorBrandBackground2,
    color: fluentTokens.colorBrandForeground1,
    fontWeight: "600" as any,
  },
  icon: {
    fontSize: "20px",
    display: "flex",
    alignItems: "center" as const,
  },
  navItemWithExternal: {
    display: "flex",
    justifyContent: "space-between" as const,
    width: "100%" as any,
  },
  externalLink: {
    fontSize: "16px",
    color: fluentTokens.colorNeutralForeground3,
    ...shorthands.transition("color", "0.1s", "ease"),
    ":hover": {
      color: fluentTokens.colorBrandForeground1,
    },
  },
});

export interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  external?: boolean;
  appUrl?: string;
}

export interface NavDrawerProps {
  open: boolean;
  items: NavItem[];
}

export function NavDrawer({ open, items }: NavDrawerProps) {
  const styles = useStyles();
  const pathname = usePathname();

  return (
    <div className={`${styles.drawer} ${!open ? styles.drawerClosed : ""}`}>
      <nav className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <div key={item.href} style={{ position: "relative" }}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <Icon className={styles.icon} />
                <span>{item.label}</span>
              </Link>
              {item.appUrl && (
                <a
                  href={item.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  title={`Open ${item.label} app`}
                >
                  <OpenRegular />
                </a>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
