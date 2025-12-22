"use client";

import {
  makeStyles,
  shorthands,
  tokens as fluentTokens,
  Card,
  Title3,
  Body1,
  Caption1,
  Button,
  Badge,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
} from "@fluentui/react-components";
import { PlayRegular, PauseRegular, DismissRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  page: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  header: {
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
  section: {
    marginTop: "16px",
  },
});

interface Pipeline {
  id: string;
  name: string;
  status: "running" | "paused" | "stopped";
  progress: string;
  lastRun: string;
}

const pipelines: Pipeline[] = [
  { id: "1", name: "Data Ingestion Pipeline", status: "running", progress: "75%", lastRun: "2 mins ago" },
  { id: "2", name: "ETL Transform Job", status: "running", progress: "45%", lastRun: "5 mins ago" },
  { id: "3", name: "Model Training Pipeline", status: "paused", progress: "100%", lastRun: "1 hour ago" },
  { id: "4", name: "Batch Processing", status: "stopped", progress: "0%", lastRun: "3 hours ago" },
];

const columns: TableColumnDefinition<Pipeline>[] = [
  createTableColumn<Pipeline>({
    columnId: "name",
    renderHeaderCell: () => "Pipeline Name",
    renderCell: (item) => item.name,
  }),
  createTableColumn<Pipeline>({
    columnId: "status",
    renderHeaderCell: () => "Status",
    renderCell: (item) => (
      <Badge
        appearance="filled"
        color={
          item.status === "running"
            ? "success"
            : item.status === "paused"
            ? "warning"
            : "danger"
        }
      >
        {item.status}
      </Badge>
    ),
  }),
  createTableColumn<Pipeline>({
    columnId: "progress",
    renderHeaderCell: () => "Progress",
    renderCell: (item) => item.progress,
  }),
  createTableColumn<Pipeline>({
    columnId: "lastRun",
    renderHeaderCell: () => "Last Run",
    renderCell: (item) => item.lastRun,
  }),
  createTableColumn<Pipeline>({
    columnId: "actions",
    renderHeaderCell: () => "Actions",
    renderCell: (item) => (
      <div style={{ display: "flex", gap: "8px" }}>
        {item.status === "running" ? (
          <Button size="small" appearance="subtle" icon={<PauseRegular />} />
        ) : (
          <Button size="small" appearance="subtle" icon={<PlayRegular />} />
        )}
        <Button size="small" appearance="subtle" icon={<DismissRegular />} />
      </div>
    ),
  }),
];

export default function WorkerPage() {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title3>Eden Worker</Title3>
        <Body1>Distributed task processing and job orchestration</Body1>
      </div>

      <div className={styles.metrics}>
        <Card className={styles.metricCard}>
          <Caption1>Active Pipelines</Caption1>
          <div className={styles.metricValue}>12</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Queued Jobs</Caption1>
          <div className={styles.metricValue}>48</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Avg Processing Time</Caption1>
          <div className={styles.metricValue}>2.4s</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Success Rate</Caption1>
          <div className={styles.metricValue}>99.2%</div>
        </Card>
      </div>

      <div className={styles.section}>
        <Title3 style={{ marginBottom: "16px" }}>Active Pipelines</Title3>
        <Card>
          <DataGrid
            items={pipelines}
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
            <DataGridBody<Pipeline>>
              {({ item, rowId }) => (
                <DataGridRow<Pipeline> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </Card>
      </div>
    </div>
  );
}
