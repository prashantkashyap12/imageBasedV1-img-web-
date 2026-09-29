import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NormalHeader from "components/Headers/NormalHeader";
import {
  fetchCsvHeader,
  generateResultExcel2,
  getDBRecords,
} from "helper/ResultGenerationHelper";
import "./ResultUI.css";

// ─── Constants ───────────────────────────────────────────────────────────────
const ALLOWED_EXT = [".csv", ".xlsx", ".xls"];
const MAX_FILE_MB = 10;
const MARK_REGEX = /^\d+(\.\d+)?$/; // non-negative decimal

// ─── Pure helpers (kept outside the component) ──────────────────────────────
const getNum = (q) => Number(String(q).replace(/\D/g, ""));

/** Strip hidden BOM / zero-width characters and surrounding spaces from a header. */
const cleanHeader = (v) =>
  String(v).replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const getExt = (name = "") => name.slice(name.lastIndexOf(".")).toLowerCase();

/**
 * GetDB_Rec returns { state, queryResult: [{ folderName, dateTime, fileName, … }] }.
 * value = fileName (sent as BubbleTableName), label = readable folder + date.
 */
const normalizeTables = (res) => {
  const list = Array.isArray(res)
    ? res
    : res?.queryResult || res?.data || res?.tables || res?.result || [];
  return list
    .map((t) => {
      if (typeof t === "string") return { value: t, label: t };
      const value = t?.fileName || t?.name || t?.tableName || t?.TABLE_NAME;
      if (!value) return null;
      const label =
        t?.folderName && t?.dateTime
          ? `${t.folderName} (${t.dateTime})`
          : value;
      return { value, label };
    })
    .filter(Boolean);
};

/** Column names of a table = keys of its rows (GetDB_Rec?fileName=<table>). */
const extractColumns = (res) => {
  const rows = Array.isArray(res)
    ? res
    : res?.queryResult || res?.data || res?.records || res?.result || [];
  const cols = new Set();
  rows.slice(0, 20).forEach((r) => {
    if (r && typeof r === "object") Object.keys(r).forEach((k) => cols.add(k));
  });
  return [...cols];
};

/** Proper CSV parser (handles quoted commas, quotes and \r\n). */
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell !== ""));
};

const rowsToCsvBlob = (headers, rows) => {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  return new Blob([lines.join("\n")], { type: "text/csv" });
};

/**
 * Turns whatever GenerateResultExcel2 returns (CSV text, xlsx blob or JSON rows)
 * into { headers, tableData, blob } for the result table page.
 */
const toResult = async (data) => {
  // JSON rows
  const jsonRows = Array.isArray(data) ? data : data?.data || data?.rows;
  if (Array.isArray(jsonRows) && !(data instanceof Blob)) {
    const headers = jsonRows.length ? Object.keys(jsonRows[0]) : [];
    return {
      headers,
      tableData: jsonRows,
      blob: rowsToCsvBlob(headers, jsonRows),
    };
  }

  const buffer =
    data instanceof Blob
      ? await data.arrayBuffer()
      : data instanceof ArrayBuffer
        ? data
        : null;

  // .xlsx files are zip archives → start with "PK". Not supported in the list view.
  if (buffer) {
    const b = new Uint8Array(buffer, 0, 2);
    if (b[0] === 0x50 && b[1] === 0x4b) {
      throw new Error(
        "The server returned an Excel file. Ask the backend for CSV output.",
      );
    }
  }

  const text = buffer ? new TextDecoder().decode(buffer) : String(data ?? "");
  const [head = [], ...body] = parseCsv(text);
  const headers = head.map((h) => h.trim());
  const tableData = body.map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
  return { headers, tableData, blob: new Blob([text], { type: "text/csv" }) };
};

/**
 * Builds the `questions` param. ONE place to change if the backend expects a
 * different string format (e.g. "Maths:1-20,Physics:21-40").
 */
const buildQuestionsParam = (list) =>
  JSON.stringify(
    list.map((q) => ({ subject: q.subject, startQ: q.startQ, endQ: q.endQ })),
  );

// ─── Component ───────────────────────────────────────────────────────────────
const ResultGenerateUI = () => {
  const navigate = useNavigate();

  // Inputs
  const [keyFile, setKeyFile] = useState(null);
  const [ansKeyHeaders, setAnsKeyHeaders] = useState([]);
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [positive, setPositive] = useState("1");
  const [negative, setNegative] = useState("0");
  const [percentage, setPercentage] = useState(false);
  const [grade, setGrade] = useState(false);

  // Extra headers (checked columns of the selected table)
  const [extraHeaders, setExtraHeaders] = useState([]);

  // Subject range builder
  const [subject, setSubject] = useState("");
  const [startQ, setStartQ] = useState("");
  const [endQ, setEndQ] = useState("");
  const [questionList, setQuestionList] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);
  const [tableColumns, setTableColumns] = useState([]);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [columnsError, setColumnsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setError = (field, msg) =>
    setErrors((prev) => ({ ...prev, [field]: msg }));

  // ── Load bubble-scan tables ────────────────────────────────────────────────
  const loadTables = async () => {
    setTablesLoading(true);
    setTablesError("");
    try {
      const res = await getDBRecords(); // GET api/showRecord/GetDB_Rec
      const list = normalizeTables(res);
      setTables(list);
      if (list.length === 0) setTablesError("No saved scan tables found.");
    } catch (err) {
      console.error("Error loading tables:", err);
      setTablesError("Could not load scan tables. Please retry.");
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // ── Load columns of the selected table ─────────────────────────────────────
  const loadTableColumns = async (name) => {
    setTableColumns([]);
    setSelectedKey("");
    setExtraHeaders([]);
    setColumnsError("");
    if (!name) return;

    setColumnsLoading(true);
    try {
      const res = await getDBRecords(name); // GET GetDB_Rec?fileName=<table>
      const cols = extractColumns(res);
      setTableColumns(cols);
      if (cols.length === 0) setColumnsError("This table has no columns to select.");
    } catch (err) {
      console.error("Error loading table columns:", err);
      setColumnsError("Could not load the table columns. Select the table again.");
    } finally {
      setColumnsLoading(false);
    }
  };

  // ── Answer key upload ──────────────────────────────────────────────────────
  const handleKeyFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!ALLOWED_EXT.includes(getExt(file.name))) {
      setError("keyFile", "Invalid file type. Upload a .csv, .xlsx or .xls file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError("keyFile", `File is too large. Maximum size is ${MAX_FILE_MB} MB.`);
      return;
    }

    setKeyLoading(true);
    try {
      // Clean hidden BOM / zero-width characters (common in Excel exports)
      // so "\uFEFFQ1" is read as "Q1".
      const headers = ((await fetchCsvHeader(file)) || []).map(cleanHeader);
      if (headers.length === 0) {
        setError("keyFile", "No column headers found in this file.");
        return;
      }
      if (!headers.some((h) => h.toLowerCase().startsWith("q"))) {
        setError(
          "keyFile",
          "No question columns (Q1, Q2, …) found in the answer key.",
        );
        return;
      }
      setKeyFile(file);
      setAnsKeyHeaders(headers);
      setErrors((prev) => ({ ...prev, keyFile: "" }));
      // Reset anything that depended on the previous key file
      setQuestionList([]);
      setStartQ("");
      setEndQ("");
    } catch (err) {
      console.error("Error reading key file:", err);
      setError("keyFile", "Could not read this file. Check the format and try again.");
    } finally {
      setKeyLoading(false);
    }
  };

  const clearKeyFile = () => {
    setKeyFile(null);
    setAnsKeyHeaders([]);
    setQuestionList([]);
    setStartQ("");
    setEndQ("");
  };

  // ── Question ranges ────────────────────────────────────────────────────────
  const questionHeaders = useMemo(
    () => ansKeyHeaders.filter((h) => h.toLowerCase().startsWith("q")),
    [ansKeyHeaders],
  );

  const usedSet = useMemo(() => {
    const set = new Set();
    questionList.forEach((q) => {
      for (let i = getNum(q.startQ); i <= getNum(q.endQ); i++) set.add(i);
    });
    return set;
  }, [questionList]);

  const handleAddSubject = () => {
    const name = subject.trim();
    let msg = "";

    if (!keyFile) msg = "Upload the answer key first.";
    else if (!name) msg = "Enter a subject name.";
    else if (!startQ || !endQ) msg = "Select the start and end question.";
    else if (
      questionList.some((q) => q.subject.toLowerCase() === name.toLowerCase())
    )
      msg = `Subject "${name}" is already added.`;
    else {
      const s = getNum(startQ);
      const e = getNum(endQ);
      if (s > e) msg = "Start question must not be after the end question.";
      else {
        for (let i = s; i <= e; i++) {
          if (usedSet.has(i)) {
            msg = `Question ${i} already belongs to another subject.`;
            break;
          }
        }
      }
    }

    if (msg) {
      setError("ranges", msg);
      return;
    }

    setQuestionList((prev) =>
      [...prev, { subject: name, startQ, endQ }].map((item, i) => ({
        ...item,
        id: i + 1,
      })),
    );
    setSubject("");
    setStartQ("");
    setEndQ("");
    setError("ranges", "");
  };

  const handleDeleteSubject = (id) => {
    if (!window.confirm("Remove this subject range?")) return;
    setQuestionList((prev) =>
      prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, id: i + 1 })),
    );
  };

  // ── Extra headers ──────────────────────────────────────────────────────────
  const toggleHeader = (h) =>
    setExtraHeaders((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );

  // The student key is added by the server, so it is not offered here.
  const headerOptions = tableColumns.filter((h) => h !== selectedKey);

  const allHeadersChecked =
    headerOptions.length > 0 && extraHeaders.length === headerOptions.length;

  const toggleAllHeaders = () =>
    setExtraHeaders(allHeadersChecked ? [] : [...headerOptions]);

  // ── Validate + submit ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!keyFile) e.keyFile = "Upload the answer key (.csv, .xlsx or .xls).";
    if (!tableName) e.tableName = "Select a bubble scan table.";
    // The student key is a column of the scan TABLE (chosen from tableColumns),
    // not of the answer key. The key file only holds Q1..Qn, so it is not
    // checked against selectedKey here.
    if (!selectedKey) e.selectedKey = "Select the key that identifies each student.";
    if (!MARK_REGEX.test(String(positive).trim()))
      e.positive = "Enter a valid number, e.g. 1 or 0.25.";
    if (!MARK_REGEX.test(String(negative).trim()))
      e.negative = "Enter a valid number, e.g. 0 or 0.25.";
    if (questionList.length === 0)
      e.ranges =
        subject.trim() && startQ && endQ
          ? `Click "+ Add subject" to save "${subject.trim()}" (${startQ} to ${endQ}) first.`
          : "Add at least one subject with a question range.";
    setErrors(e);
    return e; // empty object = valid
  };

  const handleProcess = async () => {
    console.log("Generate clicked", {
      keyFile: keyFile?.name,
      tableName,
      selectedKey,
      ranges: questionList.length,
    });

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      console.warn("Validation failed:", errs);
      toast.warn(`Cannot generate. ${Object.values(errs).join(" ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("AnswerKey", keyFile);
      formData.append("BubbleTableName", tableName);
      formData.append("selectedKey", selectedKey);
      formData.append("questions", buildQuestionsParam(questionList));
      formData.append("positive", Number(positive));
      formData.append("negative", Number(negative));
      formData.append("percentage", percentage);
      formData.append("grade", grade);
      // Comma-separated extra columns. The server already adds the student
      // key as the first result column, so it is not sent here.
      const headersToSend = extraHeaders.filter((h) => h !== selectedKey);
      if (headersToSend.length > 0)
        formData.append("selectedHeaders", headersToSend.join(","));

      const data = await generateResultExcel2(formData);
      const { headers, tableData, blob } = await toResult(data);

      if (!tableData.length) {
        toast.warn("The result is empty. Check the table and answer key.");
        return;
      }

      navigate("/admin/result-table", {
        state: { tableHeaders: headers, tableData, resultBlob: blob },
      });
    } catch (err) {
      // generateResultExcel2 already toasts the server's message.
      // Only toast here for failures that happened after the request (parsing).
      console.error("Error generating result:", err);
      if (!err?.response)
        toast.error(err?.message || "Could not read the generated result.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  const FieldError = ({ name }) =>
    errors[name] ? (
      <div className="text-danger small mt-1">{errors[name]}</div>
    ) : null;

  return (
    <div className="result-page">
      <NormalHeader />

      <div className="result-wrapper">
        <div className="result-card">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h4 className="result-title m-0">Result Generation</h4>
          </div>

          <div className="row g-3 mb-3">
            {/* STEP 1 – Answer key + scan table */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="result-panel">
                <p className="step-title">Step 1: Answer key &amp; scan table</p>

                <div className="panel-body">
                  <label className="upload-box yellow mb-2">
                    <p className="mb-1 small">
                      {keyLoading ? "Reading file…" : "Upload answer key"}
                    </p>
                    <span className="text-muted small">csv, xlsx, xls</span>
                    <input
                      type="file"
                      hidden
                      accept={ALLOWED_EXT.join(",")}
                      onChange={handleKeyFile}
                      disabled={keyLoading}
                    />
                  </label>
                  <FieldError name="keyFile" />

                  {keyFile && (
                    <div className="file-chip mt-2">
                      {keyFile.name}
                      <span
                        className="ms-auto cursor-pointer"
                        role="button"
                        aria-label="Remove answer key"
                        onClick={clearKeyFile}
                      >
                        ×
                      </span>
                    </div>
                  )}

                  <label className="form-label-custom mt-3">
                    Bubble scan table<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select input-custom"
                    value={tableName}
                    onChange={(e) => {
                      setTableName(e.target.value);
                      setError("tableName", "");
                      loadTableColumns(e.target.value);
                    }}
                    disabled={tablesLoading}
                  >
                    <option value="">
                      {tablesLoading ? "Loading tables…" : "Select table"}
                    </option>
                    {tables.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <FieldError name="tableName" />
                  {tablesError && (
                    <div className="text-danger small mt-1">
                      {tablesError}{" "}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 align-baseline"
                        onClick={loadTables}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2 – Rules (full width row on tablets, middle column on desktop) */}
            <div className="col-12 order-md-3 order-xl-0 col-xl-6">
              <div className="result-panel">
                <div
                  className="d-flex flex-wrap justify-content-between align-items-center"
                  style={{ gap: 4 }}
                >
                  <p className="step-title-lg m-0">Step 2: Define rule</p>
                  <i style={{ fontSize: "12px" }}>Add one row per subject</i>
                </div>

                <div className="panel-body">
                  <div className="mb-2">
                    <label className="form-label-custom">
                      Subject<span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control input-custom"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="row g-2 mb-1">
                    <div className="col">
                      <label className="form-label-custom">
                        Start question<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select input-custom"
                        value={startQ}
                        onChange={(e) => {
                          setStartQ(e.target.value);
                          setEndQ("");
                        }}
                        disabled={!keyFile}
                      >
                        <option value="">Select</option>
                        {questionHeaders
                          .filter((q) => !usedSet.has(getNum(q)))
                          .map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col">
                      <label className="form-label-custom">
                        End question<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select input-custom"
                        value={endQ}
                        onChange={(e) => setEndQ(e.target.value)}
                        disabled={!startQ}
                      >
                        <option value="">Select</option>
                        {questionHeaders
                          .filter(
                            (q) =>
                              startQ &&
                              getNum(q) >= getNum(startQ) &&
                              !usedSet.has(getNum(q)),
                          )
                          .map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <FieldError name="ranges" />

                  <div className="row g-2 my-2">
                    <div className="col">
                      <label className="form-label-custom text-success">
                        Correct marks (+)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        className="form-control input-custom"
                        value={positive}
                        onChange={(e) => {
                          setPositive(e.target.value);
                          setError("positive", "");
                        }}
                      />
                      <FieldError name="positive" />
                    </div>

                    <div className="col">
                      <label className="form-label-custom text-danger">
                        Negative marks (−)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        className="form-control input-custom"
                        value={negative}
                        onChange={(e) => {
                          setNegative(e.target.value);
                          setError("negative", "");
                        }}
                      />
                      <FieldError name="negative" />
                    </div>
                  </div>

                  <div
                    className="d-flex flex-wrap justify-content-between align-items-start mt-2"
                    style={{ gap: 12 }}
                  >
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

                    <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                      <label className="form-label-custom d-block mb-1">
                        Student key <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select input-custom"
                        value={selectedKey}
                        onChange={(e) => {
                          const key = e.target.value;
                          setSelectedKey(key);
                          setExtraHeaders((prev) => prev.filter((h) => h !== key));
                          setError("selectedKey", "");
                        }}
                        disabled={!tableName || columnsLoading}
                      >
                        <option value="">
                          {!tableName
                            ? "Select a table first"
                            : columnsLoading
                              ? "Loading columns…"
                              : "Select key"}
                        </option>
                        {tableColumns.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <FieldError name="selectedKey" />
                      {columnsError && (
                        <div className="text-danger small mt-1">{columnsError}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3 – Extra headers */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="result-panel">
                <p className="step-title-lg">Step 3: Extra headers</p>

                <div className="panel-body">
                  {!tableName ? (
                    <p className="text-muted small">
                      Select a scan table to see its columns.
                    </p>
                  ) : columnsLoading ? (
                    <p className="text-muted small">Loading columns…</p>
                  ) : tableColumns.length === 0 ? (
                    <p className="text-muted small">No columns available.</p>
                  ) : (
                    <>
                      <p className="text-muted small mb-2">
                        Tick the columns to include in the result. The student
                        key column is added automatically.
                      </p>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="hdr-all"
                          checked={allHeadersChecked}
                          onChange={toggleAllHeaders}
                        />
                        <label
                          className="form-check-label small fw-semibold"
                          htmlFor="hdr-all"
                        >
                          Select all
                        </label>
                      </div>
                      <div className="header-box">
                        {headerOptions.map((h, i) => (
                          <div key={h} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`hdr-${i}`}
                              checked={extraHeaders.includes(h)}
                              onChange={() => toggleHeader(h)}
                            />
                            <label
                              className="form-check-label small"
                              htmlFor={`hdr-${i}`}
                            >
                              {h}
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div
            className="d-flex flex-wrap justify-content-between mb-3"
            style={{ gap: 8 }}
          >
            <button
              type="button"
              className="btn-add"
              onClick={handleAddSubject}
              disabled={submitting}
            >
              + Add subject
            </button>

            <button
              type="button"
              className="btn-primary-custom"
              onClick={handleProcess}
              disabled={submitting || keyLoading}
            >
              {submitting ? "Generating…" : "Generate result"}
            </button>
          </div>

          {/* PREVIEW */}
          <div style={{ maxHeight: "170px", overflowY: "auto", overflowX: "auto" }}>
            <p className="fw-semibold mb-2">Subject ranges</p>

            {questionList.length === 0 ? (
              <p className="text-muted text-center small">
                No subjects added yet
              </p>
            ) : (
              <table className="table table-sm table-custom" style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Start Q</th>
                    <th>End Q</th>
                    <th>Correct</th>
                    <th>Negative</th>
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
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm text-danger p-0"
                          onClick={() => handleDeleteSubject(q.id)}
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