import React from "react";
import { useLocation } from "react-router-dom";
import ResultTable from "./ResultTable";

const ResultTablePage = () => {
  const location = useLocation();

  const tableHeaders = location.state?.tableHeaders || [];
  const tableData = location.state?.tableData || [];
  const resultBlob = location.state?.resultBlob || [];

  return (
    <div style={{ maxHeight:"60%"}}>
      <ResultTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        resultBlob= {resultBlob}
      />
    </div>
  );
};

export default ResultTablePage;