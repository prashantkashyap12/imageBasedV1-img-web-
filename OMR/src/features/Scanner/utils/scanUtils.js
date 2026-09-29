// Constants ───────────────────────────────────────────────────────────────
export const MAX_VISIBLE = 20;

// Cell colouring rules ────────────────────────────────────────────────────
// Characters the scanner uses inside a value (seen in the roll number column,
// e.g. "75672-4", "*-----", "15240*3"). Change here if the backend differs.
export const BLANK_CHAR = "-"; // an unfilled bubble
export const MULTI_CHAR = "*"; // more than one bubble filled

// Columns that are NOT scanned answers → never coloured by value.
// (compared in lower case, without spaces)
const META_COLUMNS = new Set([
  "livetime",
  "username",
  "status",
  "report",
  "sr",
  "serialno",
  "filename",
  "success",
  "id",
]);

export const isMetaColumn = (field = "") =>
  META_COLUMNS.has(String(field).toLowerCase().replace(/\s+/g, ""));

export const COLORS = {
  blank: "#fff176", // yellow      – completely blank
  partial: "#fff176", // yellow    – some filled, some blank
  multi: "#ff8a80", // red         – multiple answers
  multiBlank: "#bdbdbd", // grey   – multiple answers + blanks
  valid: "#c8e6c9", // light green – valid, no blanks / multiples
  rowFalse: "#e53935", // row red   – Status is FALSE (whole row)
  rowFalseText: "#ffffff",
};

/**
 * Returns "blank" | "partial" | "multi" | "multiBlank" | "valid"
 *  - blank      : empty, or nothing but "-"
 *  - partial    : has digits AND "-"          (e.g. 75672-4)
 *  - multi      : has "*" and no "-"          (e.g. 15240*3, or "*")
 *  - multiBlank : has both "*" and "-"        (e.g. *-----)
 *  - valid      : none of the above
 */
export function classifyCell(value) {
  const s = value == null ? "" : String(value).trim();
  if (s === "" || [...s].every((c) => c === BLANK_CHAR)) return "blank";

  const hasMulti = s.includes(MULTI_CHAR);
  const hasBlank = s.includes(BLANK_CHAR);

  if (hasMulti && hasBlank) return "multiBlank";
  if (hasMulti) return "multi";
  if (hasBlank) return "partial";
  return "valid";
}

/** True when the row's Status is false / "False" / "FALSE". */
export const isFalseStatus = (row) => {
  const v = row?.Status ?? row?.status ?? row?.Success;
  return String(v).trim().toLowerCase() === "false";
};

/** False for the empty filler rows the grid adds below the last record. */
export const hasRowData = (row) =>
  !!row &&
  Object.values(row).some(
    (v) => v !== null && v !== undefined && String(v).trim() !== "",
  );

// Debounce ─────────────────────────────────────────────────────────────────
export function debounce(func, delay) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// Grid Empty Template ─────────────────────────────────────────────────────
export function emptyMessageTemplate() {
  return (
    <div className="text-center">
      <img
        src="https://ej2.syncfusion.com/react/demos/src/grid/images/emptyRecordTemplate_light.svg"
        className="d-block mx-auto my-2"
        alt="No record"
      />
      <span>
        There is no data available to display at the moment.
      </span>
    </div>
  );
}