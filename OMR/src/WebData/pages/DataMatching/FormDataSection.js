import React from "react";

const FormDataSection = ({
  csvCurrentData,
  csvData,
  templateHeaders,
  imageColName,
  inputRefs,
  handleKeyDownJump,
  changeCurrentCsvDataHandler,
  imageFocusHandler,
  focusedIndex,
  setFocusedIndex
}) => {
  const blankDefinition =
    templateHeaders?.blankDefination === "space"
      ? " "
      : templateHeaders?.blankDefination;

  return (
    <div className="border-end col-lg-3 col-xl-2 order-lg-1">
      <div className="w-100">
        <article
          style={{ scrollbarWidth: "thin", maxHeight: "80vh" }}
          className="py-4 mt-3 mt-lg-5 shadow rounded bg-primary d-flex flex-row flex-lg-column align-items-center overflow-auto mx-auto"
        >
          {csvCurrentData &&
            Object.entries({ ...csvData[0] }).map(([key, value], i) => {
              const templateData = templateHeaders?.templetedata.find(
                (data) =>
                  data.attribute === value &&
                  data.fieldType === "formField"
              );

              if (key !== imageColName && templateData) {
                const isEmptyOrBlank =
                  !csvCurrentData[key] ||
                  csvCurrentData[key] === blankDefinition ||
                  (typeof csvCurrentData[key] === "string" &&
                    (csvCurrentData[key].includes(
                      templateHeaders?.patternDefinition
                    ) ||
                      csvCurrentData[key].includes(blankDefinition)));

                return (
                  <div
                    key={i}
                    className="w-75 px-2 py-2 d-flex flex-column align-items-center"
                  >
                    <label className="w-100 fw-semibold py-2 shadow-sm rounded">
                      <span className="text-white fw-bold d-flex">
                        {key?.toUpperCase()}
                      </span>
                    </label>

                    <input
                      type="text"
                      className={`form-control text-center mt-2 
                        ${isEmptyOrBlank ? "bg-danger text-dark" : ""}
                        ${i === focusedIndex ? "bg-warning text-dark" : ""}
                      `}
                      style={{ maxWidth: "200px" }}
                      ref={(el) => (inputRefs.current[i] = el)}
                      value={csvCurrentData[key]}
                      onKeyDown={(e) => handleKeyDownJump(e, i)}
                      onChange={(e) =>
                        changeCurrentCsvDataHandler(key, e.target.value)
                      }
                      onFocus={() => {
                        imageFocusHandler(key);
                        setFocusedIndex(i);
                      }}
                      onBlur={() => setFocusedIndex(null)}
                    />
                  </div>
                );
              }
            })}
        </article>
      </div>
    </div>
  );
};

export default FormDataSection;