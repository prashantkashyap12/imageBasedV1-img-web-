import React from "react";

const QuestionsDataSection = ({
  csvCurrentData,
  csvData,
  templateHeaders,
  imageColName,
  currentFocusIndex,
  inputRefs,
  handleKeyDownJump,
  changeCurrentCsvDataHandler,
  imageFocusHandler,
}) => {
  const blankDefination =
    templateHeaders?.blankDefination === "space"
      ? " "
      : templateHeaders?.blankDefination;

  console.log(csvCurrentData);

  return (
    <div className="w-100 col-xl-8 mx-auto text-white px-xl-3">
      <div className="my-4 w-100">
        <label
          className="fs-5 fw-semibold ms-2"
          htmlFor="questions"
        >
          Questions:
        </label>

        <div
          className="d-flex overflow-auto mt-3 ms-2"
          style={{ maxHeight: "360px" }}
        >
          <div className="d-flex flex-wrap">
            {csvCurrentData &&
              Object.entries(csvCurrentData).map(([key, value], i) => {
                const csvHeader = csvData[0][key];

                const templateData = templateHeaders?.templetedata.find(
                  (data) => data.attribute === csvHeader
                );

                if (
                  templateData &&
                  templateData.fieldType === "questionsField" &&
                  key !== imageColName
                ) {
                  const inputValue = csvCurrentData[key]?.toString() || "";

                  const isRed =
                    !inputValue?.trim() ||
                    inputValue.includes(blankDefination) ||
                    (templateHeaders?.patternDefinition &&
                      inputValue.includes(
                        templateHeaders?.patternDefinition
                      ));

                  return (
                    <div key={i} className="me-3 my-1 d-flex align-items-center">
                      <label
                        htmlFor={`Quantity${i}`}
                        className="fw-bold small me-1"
                        style={{ width: "35px" }}
                      >
                        {key}
                      </label>

                      <div>
                        <input
                          type="text"
                          id={`Quantity${i}`}
                          className={`form-control text-center p-0 ${
                            isRed ? "bg-danger text-white" : "bg-white"
                          } ${
                            i === currentFocusIndex
                              ? "bg-warning text-dark"
                              : ""
                          }`}
                          style={{
                            height: "28px",
                            width: "28px",
                            fontSize: "12px",
                          }}
                          ref={(el) => (inputRefs.current[i] = el)}
                          value={inputValue}
                          onKeyDown={(e) => handleKeyDownJump(e, i)}
                          placeholder={value}
                          onChange={(e) =>
                            changeCurrentCsvDataHandler(key, e.target.value)
                          }
                          onFocus={() => imageFocusHandler(key)}
                        />
                      </div>
                    </div>
                  );
                }

                return null;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsDataSection;