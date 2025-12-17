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
            <Label htmlFor="filterUser">User</Label>
            <Input
              id="filterUser"
              value={filters.user}
              onChange={(_: unknown, data: { value: string }) =>
                setFilters((prev) => ({ ...prev, user: data.value }))
              }
              placeholder="user@contoso.com"
            />
          </div>
          <div>
            <Label htmlFor="filterModality">Modality</Label>
            <Input
              id="filterModality"
              value={filters.modality}
              onChange={(_: unknown, data: { value: string }) =>
                setFilters((prev) => ({ ...prev, modality: data.value }))
              }
              placeholder="Audio, Video..."
            />
          </div>
          <div>
            <Label htmlFor="filterStartDate">Start date</Label>
            <DatePicker
              id="filterStartDate"
              value={filters.start}
              onSelectDate={(date: Date | null | undefined) =>
                setFilters((prev) => ({ ...prev, start: date ?? undefined }))
              }
            />
          </div>
          <div>
            <Label htmlFor="filterEndDate">End date</Label>
            <DatePicker
              id="filterEndDate"
              value={filters.end}
              onSelectDate={(date: Date | null | undefined) =>
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
        <Text size={200} style={{ padding: "12px" }}>
          Hook the table up to eden-api once the timeline endpoint is available.
        </Text>
        <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #e2e8f0" }}>
          <Text size={200}>
            No live data yet? Run a query in Home, then wire this to the API timeline endpoint to show real calls.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default CallExplorerPage;
