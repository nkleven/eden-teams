import { Button, Link, Text, makeStyles, tokens } from "@fluentui/react-components";
import { ArrowLeft16Regular, ArrowCircleRight20Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    minHeight: "60vh",
    display: "grid",
    placeItems: "center",
    padding: "48px 0"
  },
  panel: {
    width: "min(720px, 100%)",
    borderRadius: "20px",
    padding: "32px",
    background: `radial-gradient(circle at 20% 20%, ${tokens.colorBrandBackground2} 0, transparent 30%),
      radial-gradient(circle at 80% 10%, ${tokens.colorPaletteDarkOrangeBackground2} 0, transparent 28%),
      linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
    boxShadow: tokens.shadow64
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    color: tokens.colorBrandForegroundLink
  },
  code: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: tokens.colorNeutralBackground5,
    color: tokens.colorNeutralForeground2,
    fontWeight: 600,
    letterSpacing: "0.08em"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px"
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px"
  },
  list: {
    marginTop: "8px",
    lineHeight: 1.6
  }
});

const NotFoundPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <div className={styles.panel} role="alert">
        <div className={styles.header}>
          <span className={styles.code}>404 · Not found</span>
          <Text size={400} weight="semibold">
            The page you’re looking for isn’t here.
          </Text>
        </div>
        <div className={styles.grid}>
          <Text size={600} weight="semibold">
            Lost in the call logs?
          </Text>
          <Text size={300}>
            Check the URL or jump to a known section. If you followed a stale link, return to the dashboard and navigate from the sidebar.
          </Text>
          <div>
            <Text weight="semibold">Quick destinations</Text>
            <div className={styles.list}>
              <ul>
                <li>
                  <Link onClick={() => navigate("/")}>Home</Link>
                </li>
                <li>
                  <Link onClick={() => navigate("/calls")}>Call Explorer</Link>
                </li>
                <li>
                  <Link onClick={() => navigate("/admin")}>Admin</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <Button appearance="primary" icon={<ArrowLeft16Regular />} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button appearance="secondary" icon={<ArrowCircleRight20Regular />} onClick={() => navigate("/")}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
