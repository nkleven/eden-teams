import {
  Card,
  CardHeader,
  Subtitle2,
  Text,
  Body1,
  tokens,
  makeStyles,
  Button
} from "@fluentui/react-components";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px"
  },
  checklist: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: "12px",
    borderRadius: tokens.borderRadiusMedium,
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  }
});

const AdminPage = () => {
  const styles = useStyles();
  return (
    <>
      <Card>
        <CardHeader header={<Subtitle2>Live Health (placeholder)</Subtitle2>} />
        <Body1>Hook this card to Log Analytics or App Insights.</Body1>
      </Card>
      <div className={styles.grid}>
        <Card>
          <CardHeader header={<Subtitle2>Enterprise C2 checklist</Subtitle2>} />
          <div className={styles.checklist}>
            <Text>- Managed identity for eden-api</Text>
            <Text>- Secrets stored in Key Vault</Text>
            <Text>- Log Analytics workspace attached</Text>
            <Text>- Alerts for Graph / OpenAI latency</Text>
          </div>
          <Button
            appearance="secondary"
            as="a"
            href="https://github.com/nkleven/eden-teams#enterprise-readiness-c2-checklist"
            target="_blank"
          >
            View README checklist
          </Button>
        </Card>
        <Card>
          <CardHeader header={<Subtitle2>Deployment</Subtitle2>} />
          <Text>
            Use GitHub Actions to build the SPA, upload to Static Web Apps, and then
            publish the Teams manifest. Track the container image tag used by
            eden-api for auditing.
          </Text>
        </Card>
      </div>
    </>
  );
};

export default AdminPage;
