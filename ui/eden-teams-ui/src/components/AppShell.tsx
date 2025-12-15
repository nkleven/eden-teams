import {
  makeStyles,
  shorthands,
  TabList,
  Tab,
  Avatar,
  Text,
  tokens
} from "@fluentui/react-components";
import type { SelectTabData, SelectTabEvent } from "@fluentui/react-components";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2
  },
  sidebar: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding("32px", "16px"),
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`
  },
  main: {
    ...shorthands.padding("32px"),
    overflowY: "auto"
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  }
});

const tabs = [
  { value: "/", label: "Home" },
  { value: "/calls", label: "Call Explorer" },
  { value: "/admin", label: "Admin" }
];

const AppShell = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const user = accounts[0];

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Text weight="semibold" size={500}>
            Eden Teams
          </Text>
          <Text size={200} color="brand">
            Microsoft Teams CDR Assistant
          </Text>
        </div>
        <TabList
          selectedValue={location.pathname}
          vertical
          onTabSelect={(_event: SelectTabEvent, data: SelectTabData) =>
            navigate(String(data.value))
          }
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        {user && (
          <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
            <Avatar name={user.name} />
            <div>
              <Text weight="semibold">{user.name}</Text>
              <Text size={200}>{user.username}</Text>
            </div>
          </div>
        )}
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default AppShell;
