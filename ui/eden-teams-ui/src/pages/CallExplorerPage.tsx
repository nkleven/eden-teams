import {
  Card,
  CardHeader,
  Label,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
  Input,
  makeStyles,
  Subtitle2,
  Text
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { useState } from "react";

const useStyles = makeStyles({
  layout: {
    display: "flex",
    gap: "24px",
    flexDirection: "column"
  },
  filters: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  }
});

const CallExplorerPage = () => {
  const styles = useStyles();
  const [filters, setFilters] = useState({
    user: "",
    modality: "",
    start: undefined as Date | undefined,
    end: undefined as Date | undefined
  });

  return (
    <div className={styles.layout}>
      <Card>
        <CardHeader header={<Subtitle2>Filters</Subtitle2>} />
        <div className={styles.filters}>
          <div>
            <Label>User</Label>
            <Input
              value={filters.user}
              onChange={(_, data) =>
                setFilters((prev) => ({ ...prev, user: data.value }))
              }
              placeholder="user@contoso.com"
            />
          </div>
          <div>
            <Label>Modality</Label>
            <Input
              value={filters.modality}
              onChange={(_, data) =>
                setFilters((prev) => ({ ...prev, modality: data.value }))
              }
              placeholder="Audio, Video..."
            />
          </div>
          <div>
            <Label>Start date</Label>
            <DatePicker
              value={filters.start}
              onSelectDate={(date) =>
                setFilters((prev) => ({ ...prev, start: date ?? undefined }))
              }
            />
          </div>
          <div>
            <Label>End date</Label>
            <DatePicker
              value={filters.end}
              onSelectDate={(date) =>
                setFilters((prev) => ({ ...prev, end: date ?? undefined }))
              }
            />
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader header={<Subtitle2>Call timeline (sample data)</Subtitle2>} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Start</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Duration</TableHeaderCell>
              <TableHeaderCell>Quality</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>2025-12-10 09:02 UTC</TableCell>
              <TableCell>john@contoso.com</TableCell>
              <TableCell>12m 44s</TableCell>
              <TableCell>Good</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2025-12-10 10:12 UTC</TableCell>
              <TableCell>sales-team@contoso.com</TableCell>
              <TableCell>25m 08s</TableCell>
              <TableCell>Packet loss</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Text size={200} tone="secondary" style={{ padding: "12px" }}>
          Hook the table up to eden-api once the timeline endpoint is available.
        </Text>
      </Card>
    </div>
  );
};

export default CallExplorerPage;
