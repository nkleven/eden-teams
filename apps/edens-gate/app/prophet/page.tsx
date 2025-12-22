"use client";

import {
  makeStyles,
  shorthands,
  Card,
  Title3,
  Body1,
  Caption1,
  Badge,
} from "@fluentui/react-components";

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
    gap: "16px",
  },
  metricCard: {
    ...shorthands.padding("16px"),
  },
  metricValue: {
    fontSize: "28px",
    fontWeight: 600,
  },
  models: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    ...shorthands.gap("16px"),
    marginTop: "24px",
  },
  modelCard: {
    ...shorthands.padding("20px"),
  },
  modelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
});

const models = [
  { name: "Sentiment Analysis v2", status: "deployed", accuracy: "94.2%", requests: "12.4K" },
  { name: "Time Series Forecaster", status: "training", accuracy: "89.1%", requests: "8.2K" },
  { name: "Image Classifier", status: "deployed", accuracy: "96.8%", requests: "25.1K" },
  { name: "Anomaly Detector", status: "deployed", accuracy: "91.5%", requests: "15.7K" },
];

export default function ProphetPage() {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title3>Eden Prophet</Title3>
        <Body1>AI model training and prediction services</Body1>
      </div>

      <div className={styles.metrics}>
        <Card className={styles.metricCard}>
          <Caption1>Deployed Models</Caption1>
          <div className={styles.metricValue}>4</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Training Jobs</Caption1>
          <div className={styles.metricValue}>2</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Avg Latency</Caption1>
          <div className={styles.metricValue}>45ms</div>
        </Card>
        <Card className={styles.metricCard}>
          <Caption1>Daily Predictions</Caption1>
          <div className={styles.metricValue}>1.2M</div>
        </Card>
      </div>

      <Title3 style={{ marginTop: "24px", marginBottom: "16px" }}>Models</Title3>
      <div className={styles.models}>
        {models.map((model) => (
          <Card key={model.name} className={styles.modelCard}>
            <div className={styles.modelHeader}>
              <Body1 weight="semibold">{model.name}</Body1>
              <Badge
                appearance="filled"
                color={model.status === "deployed" ? "success" : "warning"}
              >
                {model.status}
              </Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Caption1>Accuracy: {model.accuracy}</Caption1>
              <Caption1>Daily Requests: {model.requests}</Caption1>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
