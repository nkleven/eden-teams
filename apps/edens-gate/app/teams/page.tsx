"use client";

import {
  makeStyles,
  shorthands,
  Card,
  Title3,
  Body1,
  Caption1,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  Badge,
  Button,
} from "@fluentui/react-components";
import { AddRegular, PersonRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  page: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    ...shorthands.gap("16px"),
    marginBottom: "24px",
  },
  metricCard: {
    ...shorthands.padding("16px"),
  },
  metricValue: {
    fontSize: "28px",
    fontWeight: 600,
  },
});

interface Team {
  id: string;
  name: string;
  members: number;
  status: "active" | "archived";
  created: string;
}

const teams: Team[] = [
  { id: "1", name: "Data Engineering", members: 12, status: "active", created: "2024-01-15" },
  { id: "2", name: "ML Ops", members: 8, status: "active", created: "2024-02-20" },
  { id: "3", name: "Backend Services", members: 15, status: "active", created: "2024-03-10" },
  { id: "4", name: "Frontend Platform", members: 10, status: "active", created: "2024-03-22" },
];

const columns: TableColumnDefinition<Team>[] = [
  createTableColumn<Team>({
    columnId: "name",
    renderHeaderCell: () => "Team Name",
    renderCell: (item) => item.name,
  }),
  createTableColumn<Team>({
    columnId: "members",
    renderHeaderCell: () => "Members",
    renderCell: (item) => `${item.members} members`,
  }),
  createTableColumn<Team>({
    columnId: "status",
    renderHeaderCell: () => "Status",
    renderCell: (item) => (
      <Badge appearance="filled" color={item.status === "active" ? "success" : "subtle"}>
        {item.status}
      </Badge>
    ),
  }),
  createTableColumn<Team>({
    columnId: "created",
    renderHeaderCell: () => "Created",
    renderCell: (item) => new Date(item.created).toLocaleDateString(),
  }),
];

export default function TeamsPage() {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Title3>Eden Teams</Title3>
          <Body1>Collaboration and team management</Body1>
        </div>
        <Button appearance="primary" icon={<AddRegular />}>
          Create Team
        </Button>
      </div>

      <div className={styles.metrics}>
        <Card className={styles.metricCard}>
          <Caption1>Total Teams</Caption1>
          <div className={styles.metricValue}>48</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Active Members</Caption1>
          <div className={styles.metricValue}>245</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Projects</Caption1>
          <div className={styles.metricValue}>156</div>
        </Card>
      </div>

      <Card>
        <DataGrid
          items={teams}
          columns={columns}
          sortable
          getRowId={(item) => item.id}
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<Team>>
            {({ item, rowId }) => (
              <DataGridRow<Team> key={rowId}>
                {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </Card>
    </div>
  );
}
