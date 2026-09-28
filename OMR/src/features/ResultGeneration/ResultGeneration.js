import React, { useState } from "react";
import { fetchCsvHeader, generateResult } from "helper/ResultGenerationHelper";
import { useNavigate } from "react-router-dom";
import NormalHeader from "components/Headers/NormalHeader";
import { toast } from "react-toastify";
import "./ResultUI.css";

const ResultGenerateUI = () => {
  const [studentFile, setStudentFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [positive, setPositive] = useState(1);
  const [negative, setNegative] = useState(0);
  const [startQ, setStartQ] = useState("");
  const [endQ, setEndQ] = useState("");
  const [subject, setSubject] = useState("");
  const [percentage, setPercentage] = useState(false);
  const [grade, setGrade] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [ansKeyHeaders, setAnsKeyHeaders] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState([]);

  const navigate = useNavigate();

  const handleProcess = async () => {
    if (!questionList || questionList.length === 0) {
      toast.warn("Please First Make Table");
      return;
    }

    if (!selectedHeaders || selectedHeaders.length === 0) {
      toast.warn("Please Select the Headers");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("AnswerKey", keyFile);
      formData.append("BubbleScan", studentFile);
      formData.append("positive", positive);
      formData.append("negative", negative);
      formData.append("selectedKey", selectedKey);
      formData.append("selectedHeaders", selectedHeaders.join(","));
      formData.append(
        "compairFields",
        questionList.map((q) => `${q.startQ}-${q.endQ}`).join(","),
      );
      formData.append(
        "questions",
        JSON.stringify(
          questionList.map((q) => ({
            subject: q.subject,
            startQ: q.startQ,
            endQ: q.endQ,
          })),
        ),
      );
      formData.append("percentage", percentage);
      formData.append("grade", grade);

      const data = await generateResult(formData);

      const blob = new Blob([data], { type: "text/csv" });
      // setResultBlob(blob);

      // Convert CSV to text
      const text = await blob.text();

      // Convert CSV text → JSON
      const rows = text.split("\n").map((row) => row.split(","));

      const headers = rows[0];
      const tableData = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index];
        });
        return obj;
      });

      navigate("/admin/result-table", {
        state: {
          tableHeaders: headers,
          tableData: tableData,
          resultBlob: blob,
        },
      });
    } catch (err) {
      console.error("Error generating result:", err);
    }
  };

  const handleFileUploadForHeaders = async (file) => {
    const res = await fetchCsvHeader(file);
    setCsvHeaders(res || []);
  };

  const handleFileUploadForAnsKey = async (file) => {
    const res = await fetchCsvHeader(file);
    setAnsKeyHeaders(res || []);
  };

  const questionHeaders = ansKeyHeaders.filter((h) =>
    h.toLowerCase().startsWith("q"),
  );

  const getNum = (q) => Number(q.replace("Q", ""));

  const usedSet = new Set(
    questionList.flatMap((q) => {
      const start = getNum(q.startQ);
      const end = getNum(q.endQ);

      const arr = [];
      for (let i = start; i <= end; i++) {
        arr.push(i);
      }
      return arr;
    }),
  );

  const handleAddQuestion = () => {
    if (!startQ || !endQ || !selectedKey || !subject) {
      alert("Please fill all required fields");
      return;
    }
    const newEntry = { subject, startQ, endQ, key: selectedKey };
    const updatedList = [...questionList, newEntry].map((item, index) => ({
      ...item,
      id: index + 1,
    }));
    setQuestionList(updatedList);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure?")) return;
    const updatedList = questionList
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, id: index + 1 }));
    setQuestionList(updatedList);
  };

  const toggleHeader = (header) => {
    setSelectedHeaders((prev) =>
      prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header],
    );
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="result-page">
      <NormalHeader />

      <div className="result-wrapper">
        <div className="result-card">
          {/* TITLE */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <h4 className="result-title m-0">Result Generation</h4>
          </div>

          {/* GRID */}
          <div className="row g-3 mb-3">
            {/* STEP 1 */}
            <div className="col-md-3">
              <div className="result-panel">
                <p className="step-title">Step 1: Upload & Matching</p>

                <label className="upload-box mb-2">
                  <p className="mb-1 small">Upload Student File</p>
                  <span className="text-muted small">csv, xls</span>
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setStudentFile(file);
                      handleFileUploadForHeaders(file);
                    }}
                  />
                </label>

                <label className="upload-box yellow mb-2">
                  <p className="mb-1 small">Upload Answer Key</p>
                  <span className="text-muted small">csv, xls</span>
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setKeyFile(file);
                      handleFileUploadForAnsKey(file);
                    }}
                  />
                </label>

                {studentFile && (
                  <div className="file-chip">
                    {studentFile.name}
                    <span
                      className="ms-auto cursor-pointer"
                      onClick={() => setStudentFile(null)}
                    >
                      ×
                    </span>
                  </div>
                )}

                {keyFile && (
                  <div className="file-chip">
                    {keyFile.name}
                    <span
                      className="ms-auto cursor-pointer"
                      onClick={() => setKeyFile(null)}
                    >
                      ×
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2 */}
            <div className="col-md-6">
              <div className="result-panel">
                <div className="d-flex justify-content-between align-items-center">
                  <p className="step-title-lg m-0">Step 2: Define Rule</p>
                  <i style={{ fontSize: "12px" }}>Apply rule to table</i>
                </div>

                {/* SUBJECT */}
                <div className="mb-2">
                  <label className="form-label-custom">
                    Subject<span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    className="form-control input-custom"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* START / END */}
                <div className="row g-2 mb-2">
                  <div className="col">
                    <label className="form-label-custom">
                      Start Question<span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      className="form-select input-custom"
                      value={startQ}
                      onChange={(e) => setStartQ(e.target.value)}
                    >
                      <option value="">Select</option>
                      {questionHeaders
                        .filter((q) => !usedSet.has(getNum(q)))
                        .map((q, i) => (
                          <option key={i} value={q}>
                            {q}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col">
                    <label className="form-label-custom">
                      End Question<span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      className="form-select input-custom"
                      value={endQ}
                      onChange={(e) => setEndQ(e.target.value)}
                    >
                      <option value="">Select</option>
                      {questionHeaders
                        .filter((q) => {
                          if (!startQ) return false;
                          const num = getNum(q);
                          return num >= getNum(startQ) && !usedSet.has(num);
                        })
                        .map((q, i) => (
                          <option key={i} value={q}>
                            {q}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* MARKS */}
                <div className="row g-2 mb-2">
                  <div className="col">
                    <label className="form-label-custom text-success">
                      Correct Marks{" "}
                    </label>
                    <input
                      type="number"
                      className="form-control input-custom"
                      value={positive}
                      onChange={(e) => setPositive(e.target.value)}
                    />
                  </div>

                  <div className="col">
                    <label className="form-label-custom text-danger">
                      Negative Marks
                    </label>
                    <input
                      type="number"
                      className="form-control input-custom"
                      value={negative}
                      onChange={(e) => setNegative(e.target.value)}
                    />
                  </div>
                </div>

                {/* TOGGLES + KEY */}
                <div className="d-flex justify-content-between align-items-start mt-2">
                  <div>
                    <div className="form-check mb-1">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="pct"
                        checked={percentage}
                        onChange={() => setPercentage(!percentage)}
                      />
                      <label className="form-check-label small" htmlFor="pct">
                        Percentage
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="grd"
                        checked={grade}
                        onChange={() => setGrade(!grade)}
                      />
                      <label className="form-check-label small" htmlFor="grd">
                        Grade
                      </label>
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label-custom d-block mb-1">
                      Select Key <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select input-custom"
                      value={selectedKey}
                      onChange={(e) => setSelectedKey(e.target.value)}
                    >
                      <option value="">Select Key</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="col-md-3">
              <div className="result-panel d-flex flex-column">
                <p className="step-title-lg">Step 3: Header Selection</p>

                <div className="header-box">
                  {csvHeaders.map((header, index) => (
                    <div key={index} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedHeaders.includes(header)}
                        onChange={() => toggleHeader(header)}
                        id={`hdr-${index}`}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor={`hdr-${index}`}
                      >
                        {header}
                      </label>
                    </div>
                  ))}

                  {csvHeaders.length === 0 && (
                    <p className="text-muted small">
                      Upload student file to see headers
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn-add"
              onClick={() => {
                handleAddQuestion();
                setSubject("");
              }}
            >
              + Add Table
            </button>

            <button className="btn-primary-custom" onClick={handleProcess}>
              Press Result
            </button>
          </div>

          {/* PREVIEW TABLE */}
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            <p className="fw-semibold mb-2">Preview</p>

            {questionList.length === 0 ? (
              <p className="text-muted text-center small">No data</p>
            ) : (
              <table className="table table-sm table-custom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Start Q</th>
                    <th>End Q</th>
                    <th>Positive</th>
                    <th>Negative</th>
                    <th>Selected Key</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((q) => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>{q.subject}</td>
                      <td>{q.startQ}</td>
                      <td>{q.endQ}</td>
                      <td>{positive}</td>
                      <td>{negative}</td>
                      <td>{q.key}</td>
                      <td>
                        <button
                          className="btn btn-sm text-danger p-0"
                          onClick={() => handleDelete(q.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultGenerateUI;
