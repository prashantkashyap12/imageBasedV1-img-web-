import React, { useState } from "react";

function HeaderData({
  csvHeaders,
  handleTemplateHeaderChange,
  templateHeaders,
  selectedAssociations,
  handleCsvHeaderChange,
}) {
  const [search, setSearch] = useState("");

  const selectedValues = Object.values(selectedAssociations);

  return (
    <div className="container-fluid">

      {/* SEARCH */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <input
            type="text"
            className="form-control shadow-sm rounded-pill px-4 py-2"
            placeholder="Search CSV Header..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "15px" }}
          />
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div
        className="shadow-sm"
        style={{
          height: "60vh",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div style={{ flex: "0 0 auto" }}>
          <table className="table mb-0">
            <thead
              className="text-center"
              style={{
                background: "#f1f5f9",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <tr>
                <th className="py-3">CSV Header</th>
                <th className="py-3">Template Header</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* SCROLL BODY */}
        <div
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
          }}
        >
          <table className="table align-middle mb-0">
            <tbody>
              {csvHeaders &&
                csvHeaders
                  .filter(
                    (csvHeader) =>
                      ![
                        "Previous Values",
                        "Updated Values",
                        "User Details",
                        "Updated Col. Name",
                      ].includes(csvHeader)
                  )
                  .filter((csvHeader) =>
                    csvHeader
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((csvHeader, index) => {
                    const currentValue =
                      selectedAssociations[csvHeader] || "UserFieldName";

                    const isUnmapped =
                      currentValue === "UserFieldName";

                    return (
                      <tr
                      className="d-flex justify-content-around"
                        key={index}
                        style={{
                          background: isUnmapped
                            ? "#fff7f7"
                            : "white",
                        }}
                      >
                        {/* CSV HEADER */}
                        <td className="px-3 py-2">
                          <select
                            className="form-select custom-select-ui"
                            onChange={(e) =>
                              handleCsvHeaderChange(
                                csvHeader,
                                e.target.value
                              )
                            }
                            value={csvHeader}
                          >
                            {csvHeaders.map((csvData, idx) => (
                              <option key={idx} value={csvData}>
                                {csvData}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* TEMPLATE HEADER */}
                        <td className="px-3 py-2">
                          <select
                            className={`form-select custom-select-ui ${
                              isUnmapped
                                ? "unmapped-border"
                                : ""
                            }`}
                            onChange={(e) =>
                              handleTemplateHeaderChange(
                                csvHeader,
                                e.target.value
                              )
                            }
                            value={currentValue}
                          >
                            <option value="UserFieldName">
                              Select Field
                            </option>

                            {templateHeaders?.map(
                              (template, idx) => (
                                <option
                                  key={idx}
                                  value={template}
                                  disabled={
                                    selectedValues.includes(
                                      template
                                    ) &&
                                    currentValue !== template
                                  }
                                >
                                  {template}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEGEND */}
      <div className="mt-3 text-end">
        <small className="text-muted">
          🔴 Unmapped Fields | 🚫 Already Selected Disabled
        </small>
      </div>

      {/* CUSTOM CSS */}
      <style>
        {`
        .custom-select-ui {
          border-radius: 10px !important;
          border: 1px solid #e2e8f0 !important;
          padding: 8px 12px !important;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s ease;
        }

        .custom-select-ui:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
        }

        .custom-select-ui:hover {
          border-color: #cbd5f5 !important;
        }

        .unmapped-border {
          border-color: #f87171 !important;
          background: #fffafa;
        }

        table tbody tr:hover {
          background: #f8fafc !important;
        }

        /* SCROLLBAR */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5f5;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        `}
      </style>
    </div>
  );
}

export default HeaderData;