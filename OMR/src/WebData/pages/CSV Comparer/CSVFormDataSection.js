import React, { useEffect, useState } from "react";
const CSVFormDataSection = ({ formCsvData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (formCsvData) {
      setFormData(formCsvData);
    }
  }, [formCsvData]);

  const AllFormData = Object.entries(formData || {}).map(([key, value], i) => {
    return (
      <div
        key={i}
        className="d-flex justify-content-between align-items-center px-3 py-2 rounded-2"
        style={{
          borderBottom: "1px solid #f1f3f5",
        }}
      >
        {/* Key */}
        <span className="text-muted small fw-semibold">
          {key?.toUpperCase()}
        </span>

        {/* Value */}
        <span
          className="text-dark small fw-semibold text-end"
          style={{
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={value || ""}
        >
          {value || "-"}
        </span>
      </div>
    );
  });

  return (
    <div
      className="h-100 d-flex flex-column"
      style={{
        width: "260px",
        borderRight: "1px solid #e9ecef",
        background: "#ffffff",
        overflowY: "hidden",
        maxHeight: "700px",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 d-flex justify-content-between align-items-center"
        style={{
          borderBottom: "1px solid #eef1f4",
          background: "#fafbfc",
        }}
      >
        <span className="fw-semibold small">CSV Fields</span>
        <span className="text-muted small">
          {/* {Object.keys(formData || {}).length} */}Data
        </span>
      </div>

      {/* Data */}
      <div
        className="flex-grow-1 overflow-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        {formData && AllFormData}
      </div>
    </div>
  );
};
export default CSVFormDataSection;
