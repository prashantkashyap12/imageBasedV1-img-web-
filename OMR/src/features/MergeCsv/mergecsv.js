import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { FaFileCsv } from "react-icons/fa6";
import {
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { fetchCsvHeader, mergerCsv } from "helper/ResultGenerationHelper";
import NormalHeader from "components/Headers/NormalHeader";

const MergeCsvComponent = () => {
  const [csv1, setCsv1] = useState(null);
  const [csv2, setCsv2] = useState(null);

  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);

  const [key1, setKey1] = useState(null);
  const [key2, setKey2] = useState(null);

  const [ignoreColumns, setIgnoreColumns] = useState([]);
  const [filterKey, setFilterKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const navigate = useNavigate();

  //  Fetch Headers CSV1
  const handleCsvOneHeaders = async (file) => {
    try {
      setLoading1(true);
      const res = await fetchCsvHeader(file);
      setHeaders1(res || []);
      setKey1(null);
    } catch {
      toast.error("Failed to load CSV1 headers");
    } finally {
      setLoading1(false);
    }
  };

  //  Fetch Headers CSV2
  const handleCsvTwoHeaders = async (file) => {
    try {
      setLoading2(true);
      const res = await fetchCsvHeader(file);
      setHeaders2(res || []);
      setKey2(null);
    } catch {
      toast.error("Failed to load CSV2 headers");
    } finally {
      setLoading2(false);
    }
  };

  //  Check if keys match
  const isKeyValid = key1 && key2 && key1 === key2;

  //  Process Merge
  const handleProcess = async () => {
    if (!csv1 || !csv2) return toast.error("Upload both CSV files");

    if (!key1 || !key2) return toast.error("Select both keys");

    try {
      setLoading(true);

      if (!isKeyValid) return toast.error("Keys must match!");

      const formData = new FormData();
      formData.append("CSV1", csv1);
      formData.append("CSV2", csv2);
      formData.append("CommonKey", key1);
      formData.append("ignoreColumns", ignoreColumns.join(",") || null);
      formData.append("Filer_key", filterKey || null);

      const response = await mergerCsv(formData);

      console.log("RAW RESPONSE:", response);

      // Convert Blob → Text
      const text = await response.text();

      // Convert Text → JSON
      const finalData = JSON.parse(text);

      console.log("FINAL DATA:", finalData);

      // Validate
      if (!Array.isArray(finalData)) {
        toast.error("Invalid data format");
        return;
      }

      //  Extract headers
      const headers = Object.keys(finalData[0] || {});
      const tableData = finalData;

      console.log(headers);
      console.log(tableData);

      navigate("/admin/result-table", {
        state: {
          tableHeaders: headers,
          tableData: tableData,
          resultBlob: response,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error merging CSVs");
    } finally {
      setLoading(false);
    }
  };

  const allHeaders = [...new Set([...headers1, ...headers2])];

  return (
    <div style={{ position: "relative" }}>
      <NormalHeader />

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ padding: "24px", position: "relative", top: "-100px" }}
      >
        <div
          className="bg-white border p-4 w-100"
          style={{ maxWidth: "1200px", borderRadius: "12px" }}
        >
           <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          
            <h4
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 600,
                color: "#1a1a2e",
              }}
            >
              Merge CSV Files
            </h4>
          </div>


          {/* Upload Section */}
          <div className="row g-3 mb-4">
            {/* CSV 1 */}
            <div className="col-md-6">
              <label className="form-label text-dark">
                CSV File 1 <span className="text-danger">*</span>
              </label>
              <label
                className="w-100 border rounded-3 d-flex flex-column justify-content-center align-items-center"
                style={{
                  height: "150px",
                  borderStyle: "dashed",
                  cursor: "pointer",
                  background: "#fafafa",
                }}
              >
                <span className="text-success" style={{fontSize:"30px"}}>
                 
                  <FaFileCsv />
                </span>
                <small className="mt-1">
                  {csv1 ? csv1.name : "Upload Here"}
                </small>
                <small className="text-muted">Accepts .csv format only</small>
                <input
                  hidden
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setCsv1(file);
                    handleCsvOneHeaders(file);
                  }}
                />
              </label>
            </div>

            {/* CSV 2 */}
            <div className="col-md-6">
              <label className="form-label text-dark fw-bold">
                CSV File 2 <span className="text-danger">*</span>
              </label>
              <label
                className="w-100 border rounded-3 d-flex flex-column justify-content-center align-items-center"
                style={{
                  height: "150px",
                  borderStyle: "dashed",
                  cursor: "pointer",
                  background: "#fafafa",
                }}
              >
                <i className="text-success" style={{fontSize:"30px"}}>
                  <FaFileCsv />
                </i>
                <small className="mt-1">
                  {csv2 ? csv2.name : "Upload Here"}
                </small>
                <small className="text-muted">Accepts .csv format only</small>
                <input
                  hidden
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setCsv2(file);
                    handleCsvTwoHeaders(file);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Loader */}
          {(loading1 || loading2) && (
            <div className="text-center mb-3">
              <div className="spinner-border text-primary"></div>
              <p className="small mt-1">Extracting headers...</p>
            </div>
          )}

          {/* Key Selection */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label text-dark fw-semibold">
                Key CSV 1 <span className="text-danger">*</span>
              </label>
              <Autocomplete
                options={headers1}
                value={key1}
                disabled={!headers1.length}
                onChange={(e, v) => setKey1(v)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Enroll" size="small" />
                )}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-dark fw-semibold">
                Key CSV 2 <span className="text-danger">*</span>
              </label>
              <Autocomplete
                options={headers2}
                value={key2}
                disabled={!headers2.length}
                onChange={(e, v) => setKey2(v)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Enroll" size="small" />
                )}
              />
            </div>
          </div>

          {/* Ignore Columns */}
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Ignore Columns</label>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={allHeaders}
              value={ignoreColumns}
              onChange={(e, v) => setIgnoreColumns(v)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <span
                    className="badge bg-light text-dark me-1 border"
                    key={option}
                    {...getTagProps({ index })}
                  >
                    {option}
                  </span>
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select columns"
                  size="small"
                />
              )}
            />
          </div>

          {/* Filter Key */}
          <div className="mb-4">
            <label className="form-label text-dark fw-semibold">Filter Keys</label>
            <input
              type="text"
              className="form-control"
              placeholder="Gen : Male"
              value={filterKey}
              onChange={(e) => setFilterKey(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            className="btn w-100 text-white fw-semibold"
            style={{
              background: "#0D7FC9",
              height: "45px",
              borderRadius: "8px",
            }}
            onClick={handleProcess}
            disabled={loading}
          >
            {loading ? "Processing..." : "Merge CSV"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeCsvComponent;
