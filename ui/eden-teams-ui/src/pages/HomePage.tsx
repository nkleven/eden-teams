import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Textarea,
  tokens,
  makeStyles,
  Spinner,
  Subtitle2,
  Text,
  Toast,
  ToastTitle,
  useToastController
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { useState } from "react";
import { askQuestion } from "../api/client";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 420px) 1fr",
    gap: "24px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  summary: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: "16px",
    borderRadius: tokens.borderRadiusMedium
  }
});

interface HomePageProps {
  toasterId: string;
}

const HomePage = ({ toasterId }: HomePageProps) => {
  const styles = useStyles();
  const [question, setQuestion] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const { dispatchToast } = useToastController(toasterId);

  const exampleQuestions = [
    "Summarize Teams call quality issues for sales last week",
    "Which users had the highest drop rates yesterday?",
    "List top 5 long-duration calls this month"
  ];

  const handleSubmit = async () => {
    if (!question.trim()) {
      dispatchToast(
        <Toast>
          <ToastTitle>Please enter a question.</ToastTitle>
        </Toast>,
        { position: "top-end" }
      );
      return;
    }
    try {
      setLoading(true);
      const response = await askQuestion({
        question,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        user: user || undefined
      });
      setAnswer(response.answer);
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            {(error as Error)?.message ?? "Failed to query call records. Check API base and auth."}
          </ToastTitle>
        </Toast>,
        { position: "top-end" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.grid}>
      <Card>
        <CardHeader header={<Subtitle2>Ask about Teams call records</Subtitle2>} />
        <div className={styles.form}>
          <div>
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(_: unknown, data: { value: string }) =>
                setQuestion(data.value)
              }
              placeholder="Example: Summarize call quality issues for sales last week."
              resize="vertical"
            />
          </div>
          <div>
            <Label htmlFor="user">User / Team (optional)</Label>
            <Input
              id="user"
              value={user}
              onChange={(_: unknown, data: { value: string }) =>
                setUser(data.value)
              }
              placeholder="john@contoso.com"
            />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div>
              <Label>Start date</Label>
              <DatePicker
                value={startDate}
                onSelectDate={(date: Date | null | undefined) =>
                  setStartDate(date ?? undefined)
                }
              />
            </div>
            <div>
              <Label>End date</Label>
              <DatePicker
                value={endDate}
                onSelectDate={(date: Date | null | undefined) =>
                  setEndDate(date ?? undefined)
                }
              />
            </div>
          </div>
          <Button appearance="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size="tiny" /> : "Ask"}
          </Button>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {exampleQuestions.map((sample) => (
              <Button
                key={sample}
                size="small"
                appearance="secondary"
                onClick={() => {
                  setQuestion(sample);
                  setAnswer(null);
                }}
              >
                {sample}
              </Button>
            ))}
          </div>
        </div>
      </Card>
      <div className={styles.results}>
        <Card>
          <CardHeader header={<Subtitle2>Answer</Subtitle2>} />
          {loading && (
            <div style={{ padding: "16px" }}>
              <Spinner label="Fetching call data..." />
            </div>
          )}
          {!loading && answer && (
            <div className={styles.summary}>
              <Text>{answer}</Text>
            </div>
          )}
          {!loading && !answer && (
            <div style={{ padding: "24px" }}>
              <Subtitle2>Ask your first question</Subtitle2>
              <Text size={200} block>
                Use the samples above or type your own. We will query Teams CDRs and summarize results here.
              </Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
