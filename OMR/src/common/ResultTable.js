import NormalHeader from "components/Headers/NormalHeader";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, Container, Row, Table } from "reactstrap";
import initializeUrls from "helper/InitializeURL";
import ResultReportModal from "common/Resultreportmodal";

const PAGE_SIZE = 100; // added

const ResultTable = ({ tableHeaders = [], tableData = [], resultBlob }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // added
  const [selectedRow, setSelectedRow] = useState(null); // row shown in the report card
  const [baseUrl, setBaseUrl] = useState(""); // server that hosts the scanned images
  const navigate = useNavigate();

  // Server address comes from the same config as every other API call
  useEffect(() => {
    let active = true;
    initializeUrls()
      .then((urls) => active && setBaseUrl(urls.MAIN_URL || ""))
      .catch((err) => console.error("Could not load server URL:", err));
    return () => {
      active = false;
    };
  }, []);

  // 1. Clean Headers
  const cleanHeaders = tableHeaders.map((h) =>
    h?.toString().replace(/"/g, "").replace(/\r/g, "").trim(),
  );

  // 2. Clean Data
  const cleanData = tableData.map((row) => {
    const newRow = {};

    Object.entries(row).forEach(([key, value]) => {
      const cleanKey = key
        ?.toString()
        .replace(/"/g, "")
        .replace(/\r/g, "")
        .trim();

      let cleanValue = value;
      if (typeof cleanValue === "string") {
        cleanValue = cleanValue.replace(/"/g, "").replace(/\r/g, "").trim();
      }

      newRow[cleanKey] = cleanValue;
    });

    return newRow;
  });

  // 3. Handle Empty Case
  if (!cleanHeaders.length || !cleanData.length) {
    return (
      <div className="text-center mt-5 text-danger fw-semibold">
        No Data Props Passed
      </div>
    );
  }

  // 4. Filter Logic
  const filteredData = cleanData.filter((row) =>
    cleanHeaders.some((header) => {
      const val = row[header];
      return (
        val !== undefined &&
        val !== null &&
        val.toString().toLowerCase().includes(search.toLowerCase())
      );
    }),
  );

  // 4b. Pagination (added)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // 5. Download (changed: prefers the original file, escapes CSV values)
  const handleDownload = () => {
    if (!cleanData.length) return;

    const save = (blob, name) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      link.click();
      window.URL.revokeObjectURL(url);
    };

    // Original file from the API (csv or xlsx)
    if (resultBlob instanceof Blob) {
      save(
        resultBlob,
        resultBlob.type.includes("spreadsheetml") ? "result.xlsx" : "result.csv",
      );
      return;
    }

    // Fallback: rebuild CSV with proper escaping
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csvContent = [
      cleanHeaders.map(esc).join(","),
      ...cleanData.map((row) => cleanHeaders.map((h) => esc(row[h])).join(",")),
    ].join("\n");

    save(new Blob([csvContent], { type: "text/csv" }), "result.csv");
  };

  const handleOkay = () => {
    navigate("/admin/result-generation", { replace: true });
  };

  return (
    <div className="main-content">
      <NormalHeader />

      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <div className="col-12 col-lg-10">
            <Card className="shadow">
              {/* Header */}
              <CardHeader className="border-0">
                <div
                  className="d-flex flex-wrap justify-content-between align-items-center"
                  style={{ gap: 8 }}
                >
                  <h3 className="mb-0">Data Table </h3>

                  {/* Search */}
                  <div style={{ width: "250px", maxWidth: "100%" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search anything..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // added: back to first page on search
                      }}
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Table */}
              <div style={{ maxHeight: "60vh", overflow: "auto" }}>
                <Table className="align-items-center table-flush mb-0">
                  {/* Table Head */}
                  <thead
                    className="thead-light"
                    style={{ position: "sticky", top: 0 }}
                  >
                    <tr>
                      {cleanHeaders.map((header, index) => (
                        <th key={index} className="sticky-th text-nowrap">
                          {header}
                        </th>
                      ))}
                      <th className="sticky-th text-nowrap">Action</th>
                    </tr>
                  </thead>

                  {/* Table Body (changed: pageData instead of filteredData) */}
                  <tbody>
                    {pageData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {cleanHeaders.map((header, colIndex) => (
                          <td key={colIndex}>
                            {row[header] !== undefined && row[header] !== null
                              ? row[header]
                              : "-"}
                          </td>
                        ))}
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary text-nowrap"
                            onClick={() => setSelectedRow(row)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Footer Info (changed: pagination controls) */}
              <div className="px-4 py-2 text-muted small border-top">
                <div
                  className="d-flex flex-wrap justify-content-between align-items-center"
                  style={{ gap: 8 }}
                >
                  <span>
                    Showing {pageData.length} of {filteredData.length} records
                    {filteredData.length !== cleanData.length &&
                      ` (filtered from ${cleanData.length})`}
                  </span>
                  <span>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </button>
                    Page {page} / {totalPages}
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-3 px-md-4 py-3 d-flex flex-wrap justify-content-between gap-2">
                <button className="btn btn-primary px-4" onClick={handleOkay}>
                  Back
                </button>

                <button
                  className="btn btn-success px-4"
                  onClick={handleDownload}
                >
                  Download
                </button>
              </div>
            </Card>
          </div>
        </Row>
      </Container>

      {/* Report card (scanned sheet + result) for the clicked row */}
      <ResultReportModal
        row={selectedRow}
        headers={cleanHeaders}
        baseUrl={baseUrl || undefined}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
};

export default ResultTable;