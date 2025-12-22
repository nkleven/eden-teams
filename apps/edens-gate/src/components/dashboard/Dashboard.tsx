"use client";

import {
  makeStyles,
  shorthands,
  tokens as fluentTokens,
  Card,
  CardHeader,
  Title3,
  Body1,
  Caption1,
  Button,
  Badge,
} from "@fluentui/react-components";
import {
  ArrowTrendingRegular,
  CheckmarkCircleRegular,
  WarningRegular,
  ChevronRightRegular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  dashboard: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  header: {
    marginBottom: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    ...shorthands.gap("16px"),
  },
  metricCard: {
    height: "140px",
  },
  metricContent: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("8px"),
    height: "100%",
  },
  metricValue: {
    fontSize: "32px",
    fontWeight: 600,
    lineHeight: "40px",
  },
  metricLabel: {
    color: fluentTokens.colorNeutralForeground3,
  },
  metricHint: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    marginTop: "auto",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    ...shorthands.gap("16px"),
  },
  serviceCard: {
    cursor: "pointer",
    ...shorthands.transition("transform", "0.1s", "ease"),
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
  serviceHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceContent: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
    ...shorthands.padding("16px"),
  },
  serviceStatus: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
  serviceActions: {
    display: "flex",
    ...shorthands.gap("8px"),
  },
  serviceButton: {
    marginTop: "12px",
  },
});

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "stable";
  severity?: "success" | "warning" | "error";
}

function MetricCard({ label, value, hint, trend, severity }: MetricCardProps) {
  const styles = useStyles();
  
  const getIcon = () => {
    if (severity === "warning") return <WarningRegular />;
    if (severity === "success") return <CheckmarkCircleRegular />;
    if (trend === "up") return <ArrowTrendingRegular />;
    return null;
  };

  return (
    <Card className={styles.metricCard}>
      <div className={styles.metricContent}>
        <Caption1 className={styles.metricLabel}>{label}</Caption1>
        <div className={styles.metricValue}>{value}</div>
        {hint && (
          <div className={styles.metricHint}>
            {getIcon()}
            <Caption1>{hint}</Caption1>
          </div>
        )}
      </div>
    </Card>
  );
}

const services = [
  {
    name: "Eden Worker",
    description: "Distributed task processing and job orchestration",
    status: "healthy",
    metrics: "12 active pipelines",
    url: "http://localhost:3000",
    internalPath: "/worker",
  },
  {
    name: "Eden Prophet",
    description: "AI model training and prediction services",
    status: "healthy",
    metrics: "4 models deployed",
    url: "https://prophet.nwiss.net",
    internalPath: "/prophet",
  },
  {
    name: "Eden Teams",
    description: "Collaboration and team management",
    status: "healthy",
    metrics: "48 active teams",
    url: "https://teams.kellskreations.com",
    internalPath: "/teams",
  },
  {
    name: "Eden Market",
    description: "Data marketplace and asset exchange",
    status: "warning",
    metrics: "3 pending approvals",
    url: "http://localhost:4000",
    internalPath: "/market",
  },
  {
    name: "Eden Shepard",
    description: "Service orchestration and monitoring",
    status: "healthy",
    metrics: "All services operational",
    url: "https://shep.nwis.co.in",
    internalPath: "/shepard",
  },
  {
    name: "Eden Exodus",
    description: "Data migration and transformation",
    status: "healthy",
    metrics: "2 migrations running",
    url: "http://localhost:5173",
    internalPath: "/exodus",
  },
  {
    name: "Eden Genesis",
    description: "IFTTT-style workflow automation platform",
    status: "healthy",
    metrics: "Connect people & technology",
    url: "https://genesis.kellzkreations.com",
    internalPath: "/genesis",
  },
  {
    name: "Eden Scroll Reader",
    description: "Document processing and analysis",
    status: "healthy",
    metrics: "API ready",
    url: "http://localhost:8080/ui",
    internalPath: "/scroll-reader",
  },
];

export function Dashboard() {
  const styles = useStyles();

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <Title3>Welcome to Edens Gate</Title3>
        <Body1>Unified control plane for the Eden ecosystem</Body1>
      </div>

      <div className={styles.grid}>
        <MetricCard
          label="Active Pipelines"
          value="12"
          hint="2 running now"
          trend="up"
        />
        <MetricCard
          label="Total Datasets"
          value="48"
          hint="4 updating"
          severity="success"
        />
        <MetricCard
          label="Alerts"
          value="3"
          hint="1 needs attention"
          severity="warning"
        />
        <MetricCard
          label="API Health"
          value="99.9%"
          hint="Last 30 days"
          severity="success"
        />
      </div>

      <div>
        <Title3 style={{ marginBottom: "16px" }}>Services</Title3>
        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <Card key={service.name} className={styles.serviceCard}>
              <CardHeader
                header={<Body1>{service.name}</Body1>}
                action={
                  <div className={styles.serviceActions}>
                    <Button
                      appearance="subtle"
                      icon={<ChevronRightRegular />}
                      size="small"
                      as="a"
                      href={service.internalPath}
                      title="View in dashboard"
                    />
                  </div>
                }
              />
              <div className={styles.serviceContent}>
                <Caption1>{service.description}</Caption1>
                <div className={styles.serviceStatus}>
                  <Badge
                    appearance="filled"
                    color={service.status === "healthy" ? "success" : "warning"}
                  >
                    {service.status}
                  </Badge>
                  <Caption1>{service.metrics}</Caption1>
                </div>
                <div className={styles.serviceButton}>
                  <Button
                    appearance="primary"
                    size="small"
                    as="a"
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open App
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
