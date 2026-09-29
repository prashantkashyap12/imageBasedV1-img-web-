import React, { useEffect, useMemo, useState } from "react";

// Server that hosts the scanned sheets (the same host that serves /wFileManager/...).
// Prefer setting REACT_APP_FILE_BASE_URL in your .env file.
const DEFAULT_BASE_URL =
  process.env.REACT_APP_FILE_BASE_URL || "http://192.168.1.34:6100";

/** "wFileManager/.../1 (1).jpg" -> "http://host:6100/wFileManager/.../1%20(1).jpg" */
export const buildImageUrl = (fileName, baseUrl = DEFAULT_BASE_URL) => {
  if (!fileName) return "";
  const f = String(fileName).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(f)) return encodeURI(decodeURI(f));
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURI(f.replace(/^\/+/, ""))}`;
};

const isQuestionCol = (h) => /^q\d+$/i.test(h);
const findKey = (row, name) =>
  Object.keys(row).find((k) => k.toLowerCase() === name.toLowerCase());

/**
 * Report-card modal.
 * props:
 *   row      – one row object of the result table (header -> value)
 *   headers  – result table headers (keeps the original column order)
 *   onClose  – called when the modal is closed
 *   baseUrl  – optional override of the image server
 */
/** true when the window is narrower than `bp` px (phones / small tablets). */
const useIsNarrow = (bp = 820) => {
  const get = () => typeof window !== "undefined" && window.innerWidth < bp;
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    const onResize = () => setNarrow(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp]);
  return narrow;
};

const ResultReportModal = ({ row, headers = [], onClose, baseUrl }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const narrow = useIsNarrow();

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => setImgFailed(false), [row]);

  const report = useMemo(() => {
    if (!row) return null;
    const cols = headers.length ? headers : Object.keys(row);

    const fileKey = findKey(row, "FileName");
    const idKey = cols.find(
      (h) =>
        h !== fileKey &&
        !isQuestionCol(h) &&
        !/_(correct|wrong|marks)$/i.test(h) &&
        !/^total(correct|wrong|marks)$/i.test(h) &&
        !/^(percentage|grade)$/i.test(h),
    );

    // Subject rows: any "<Subject>_Correct / _Wrong / _Marks" trio
    const subjects = [];
    cols.forEach((h) => {
      const m = h.match(/^(.*)_correct$/i);
      if (!m) return;
      const s = m[1];
      subjects.push({
        name: s,
        correct: row[h],
        wrong: row[findKey(row, `${s}_Wrong`)] ?? "",
        marks: row[findKey(row, `${s}_Marks`)] ?? "",
      });
    });

    const totals = {
      correct: row[findKey(row, "TotalCorrect")],
      wrong: row[findKey(row, "TotalWrong")],
      marks: row[findKey(row, "TotalMarks")],
      percentage: row[findKey(row, "Percentage")],
      grade: row[findKey(row, "Grade")],
    };

    // Everything else (Sr, extra table columns…) is shown as "details"
    const used = new Set(
      [fileKey, idKey, ...subjects.flatMap((s) => [
        findKey(row, `${s.name}_Correct`),
        findKey(row, `${s.name}_Wrong`),
        findKey(row, `${s.name}_Marks`),
      ]),
      findKey(row, "TotalCorrect"),
      findKey(row, "TotalWrong"),
      findKey(row, "TotalMarks"),
      findKey(row, "Percentage"),
      findKey(row, "Grade")].filter(Boolean),
    );
    const details = cols.filter((h) => !used.has(h) && !isQuestionCol(h));

    return {
      idKey,
      idValue: idKey ? row[idKey] : "",
      imageUrl: buildImageUrl(fileKey ? row[fileKey] : "", baseUrl),
      subjects,
      totals,
      details,
    };
  }, [row, headers, baseUrl]);

  if (!row || !report) return null;

  const { idKey, idValue, imageUrl, subjects, totals, details } = report;
  const passed = totals.grade && String(totals.grade).toUpperCase() !== "F";

  const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.55)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: narrow ? 8 : 16,
  };
  const card = {
    background: "#fff",
    borderRadius: 12,
    width: "min(1200px, 100%)",
    height: narrow ? "96vh" : "min(92vh, 900px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,.35)",
    overflow: "hidden",
  };
  const stat = (label, value, color) => (
    <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || "#1f2a44" }}>
        {value === undefined || value === "" ? "–" : value}
      </div>
      <div style={{ fontSize: 11, textTransform: "uppercase", color: "#7a869a" }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid #e8ecf3",
          }}
        >
          <div>
            <h5 style={{ margin: 0, fontWeight: 700 }}>Report card</h5>
            {idKey && (
              <small style={{ color: "#7a869a" }}>
                {idKey}: <b>{idValue || "–"}</b>
              </small>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: "auto",
              border: 0,
              background: "transparent",
              fontSize: 26,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: narrow ? "column" : "row",
            flex: 1,
            minHeight: 0,
            gap: 20,
            padding: narrow ? 12 : 16,
            overflowX: "hidden",
            overflowY: narrow ? "auto" : "hidden",
          }}
        >
          {/* Left: scanned sheet */}
          <div
            style={{
              flex: narrow ? "0 0 auto" : "1 1 58%",
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8, flexShrink: 0 }}>
              Scanned sheet
            </div>
            <div
              style={{
                position: "relative",
                flex: narrow ? "0 0 auto" : 1,
                height: narrow ? "70vh" : undefined,
                minHeight: 0,
                background: "#fff",
                border: "1px solid #e8ecf3",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {imageUrl && !imgFailed ? (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ position: "absolute", inset: 0, display: "block" }}
                >
                  <img
                    src={imageUrl}
                    alt="Scanned OMR sheet"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    onError={() => setImgFailed(true)}
                  />
                </a>
              ) : (
                <div style={{ color: "#555", padding: 24, textAlign: "center" }}>
                  {imageUrl
                    ? "The scanned image could not be loaded."
                    : "No image path in this row. Tick FileName under Extra headers."}
                  {imageUrl && (
                    <div style={{ marginTop: 8, fontSize: 12, wordBreak: "break-all" }}>
                      {imageUrl}
                    </div>
                  )}
                </div>
              )}
            </div>
            {imageUrl && !imgFailed && (
              <small style={{ color: "#7a869a", flexShrink: 0, marginTop: 4 }}>
                Click the image to open it full size.
              </small>
            )}
          </div>

          {/* Right: result */}
          <div
            style={{
              flex: narrow ? "0 0 auto" : "1 1 42%",
              minWidth: 0,
              minHeight: 0,
              overflowY: narrow ? "visible" : "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f6f8fc",
                borderRadius: 10,
                marginBottom: 14,
              }}
            >
              {stat("Total marks", totals.marks)}
              {stat("Correct", totals.correct, "#1a9b5b")}
              {stat("Wrong", totals.wrong, "#d64545")}
              {totals.percentage !== undefined && stat("Percent", `${totals.percentage}%`)}
              {totals.grade !== undefined &&
                stat("Grade", totals.grade, passed ? "#1a9b5b" : "#d64545")}
            </div>

            {subjects.length > 0 && (
              <table className="table table-sm" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td>{s.correct}</td>
                      <td>{s.wrong}</td>
                      <td>{s.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {details.length > 0 && (
              <>
                <div style={{ fontWeight: 600, margin: "10px 0 6px" }}>Details</div>
                <table className="table table-sm" style={{ fontSize: 14 }}>
                  <tbody>
                    {details.map((h) => (
                      <tr key={h}>
                        <td style={{ color: "#7a869a", width: "40%" }}>{h}</td>
                        <td>{row[h]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultReportModal;