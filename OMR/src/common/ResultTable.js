import NormalHeader from "components/Headers/NormalHeader";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, Container, Row, Table } from "reactstrap";

const ResultTable = ({ tableHeaders = [], tableData = [], resultBlob }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  console.log("RAW HEADERS:", tableHeaders);
  console.log("RAW DATA:", tableData);

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

  console.log("CLEAN HEADERS:", cleanHeaders);
  console.log("CLEAN DATA SAMPLE:", cleanData[0]);

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
        val.toString().toLowerCase().includes(search.toLowerCase())
      );
    }),
  );

  // 5. Download Clean CSV
  const handleDownload = () => {
    if (!cleanData.length) return;

    const csvHeaders = cleanHeaders.join(",");

    const csvRows = cleanData.map((row) =>
      cleanHeaders.map((h) => row[h] ?? "").join(","),
    );

    const csvContent = [csvHeaders, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "result.csv");
    link.click();
  };

  const handleOkay = () => {
    navigate("/admin/result-generation", { replace: true });
  };

return (
  <div className="main-content">
    <NormalHeader />

    <Container className="mt--7" fluid>
      <Row className="justify-content-center">
        <div className="col-lg-10">
          <Card className="shadow">
            
            {/* Header */}
            <CardHeader className="border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Data Table </h3>

                {/* Search */}
                <div style={{ width: "250px" }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search anything..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            {/* Table */}
            <div style={{ maxHeight: "60vh", overflow: "auto" }}>
              <Table className="align-items-center table-flush mb-0">
                
                {/* Table Head */}
                <thead className="thead-light" style={{position:"sticky", top:0,}}>
                  <tr>
                    {cleanHeaders.map((header, index) => (
                      <th key={index} className="sticky-th text-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {cleanHeaders.map((header, colIndex) => (
                        <td key={colIndex}>
                          {row[header] !== undefined && row[header] !== null
                            ? row[header]
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 text-muted small border-top">
              Showing {filteredData.length} of {cleanData.length} records
            </div>

            {/* Actions */}
            <div className="px-4 py-3 d-flex justify-content-between gap-2">

              <button className="btn btn-primary px-4" onClick={handleOkay}>
                Back
              </button>

              <button className="btn btn-success px-4" onClick={handleDownload}>
                Download
              </button>
            </div>

          </Card>
        </div>
      </Row>
    </Container>
  </div>
);
};

export default ResultTable;
