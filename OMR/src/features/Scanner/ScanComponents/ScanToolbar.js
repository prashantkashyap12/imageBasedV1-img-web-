import { memo } from "react";
import { Button } from "reactstrap";

const ScanToolbar = memo(function ScanToolbar({ csvString, showRefresh, scanning, isPaused, isRefreshing, accuracy, viewMode, setViewMode, onStart, onPause, onResume, onRefresh, onReset,  handlehistory }) {

  const downloadCsv = () => {
    const decodedString = atob(csvString);
    const jsonData = JSON.parse(decodedString);
    const rows = jsonData.map((item) => item.FieldResults);
    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((key) => `"${row[key] ?? ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scan_results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-2 px-1">
      <div className="">
        {viewMode === "history" && (
          <Button color="warning" style={{ fontWeight: "bold" }} onClick={() => setViewMode("live")}> Return to Live Feed </Button>
        )}
        
        {viewMode === "live" && (
          <Button color="secondary" onClick={() => handlehistory(1)}>View History</Button>
        )}
        <Button color="primary" hidden={!csvString} onClick={downloadCsv}> Download CSV </Button>

      </div>

      <div className="shadow rounded bg-white px-3 py-2" style={{ minWidth: 180 }}>
        <span className="text-muted text-bold">
          Accuracy Rate{" "} <span className="fw-bold fs-5 text-dark">{accuracy}%</span>
        </span>
      </div>

      <div className="d-flex gap-2 ms-auto">

        {showRefresh && viewMode === "live" && !scanning && <Button color="info" disabled={isRefreshing || scanning} onClick={onRefresh}> Refresh Data </Button>}

        <Button color="success" disabled={scanning} onClick={onStart}>
          {scanning ? "Scanning…" : "Start"}
        </Button>

        {scanning && !isPaused && (
          <Button color="warning" onClick={onPause}> Pause </Button>
        )}

        {scanning && isPaused && (
          <Button color="info" onClick={onResume}> Resume </Button>
        )}

       {scanning &&  <Button color="danger" onClick={onReset}> Stop </Button>}
      </div>
    </div>
  );
});
export default ScanToolbar;